import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getActiveCv } from "@/lib/publicFiles";
import { getData } from "@/lib/db";
import { buildAtsCvFromData } from "@/lib/cvPdf";
import { query } from "@/lib/pg";

export const dynamic = "force-dynamic";

/**
 * GET /api/cv/view
 *
 * Public-viewable CV — streams the CV as a PDF with
 * `Content-Disposition: inline` so the browser displays it in a new tab
 * (instead of forcing a download). Used by the public "View CV" button.
 *
 * Priority:
 *   1. Active PDF uploaded from the dashboard (public_files)
 *      - DB-served:   url = /api/file/<id>  → read bytes from uploads table
 *      - Blob/remote: url = https://...      → fetch() the bytes
 *      - Local dev:   url = /uploads/<name>  → fs.readFile
 *   2. On-the-fly ATS-friendly PDF generated from the ONLINE CV data
 *      (fallback so a viewable file always exists; does not modify stored data)
 */
function safeAsciiName(name) {
  const base = (name || "CV.pdf")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/"/g, "'")
    .trim();
  return base || "CV.pdf";
}

function pdfResponse(buffer, filename) {
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${safeAsciiName(filename)}"`,
      "Cache-Control": "no-store, must-revalidate",
    },
  });
}

/**
 * Read a file from the local `uploads` DB row directly (avoids an extra
 * HTTP roundtrip to our own /api/file/[id] route).
 */
async function readDbUploadRow(id) {
  const res = await query(
    `SELECT original_name, mime_type, data FROM uploads WHERE id = $1 LIMIT 1`,
    [id],
  );
  const row = res.rows[0];
  if (!row) return null;
  return {
    buffer: Buffer.isBuffer(row.data) ? row.data : Buffer.from(row.data),
    originalName: row.original_name,
  };
}

/**
 * Resolve the active CV bytes.
 * - /api/file/<id> → read from uploads table directly
 * - https://...    → fetch remote (Vercel Blob)
 * - /uploads/...   → local filesystem (dev)
 * @returns {Promise<{buffer: Buffer, originalName?: string}|null>}
 */
async function readActiveCvBytes(activeCv) {
  if (!activeCv?.url) return null;

  // DB-served (our own /api/file/<id>)
  const match = String(activeCv.url).match(/^\/api\/file\/(\d+)$/);
  if (match) {
    const row = await readDbUploadRow(Number(match[1]));
    if (!row) return null;
    return {
      buffer: row.buffer,
      originalName: row.originalName || activeCv.original_name,
    };
  }

  // Remote (Vercel Blob / absolute URL)
  if (/^https?:\/\//i.test(activeCv.url)) {
    const upstream = await fetch(activeCv.url);
    if (!upstream.ok) {
      throw new Error(
        `Blob fetch failed: ${upstream.status} ${upstream.statusText}`,
      );
    }
    return {
      buffer: Buffer.from(await upstream.arrayBuffer()),
      originalName: activeCv.original_name,
    };
  }

  // Local filesystem (dev)
  const filePath = path.join(process.cwd(), "public", activeCv.url);
  return {
    buffer: await fs.readFile(filePath),
    originalName: activeCv.original_name,
  };
}

export async function GET() {
  // 1) Try the standalone uploaded PDF
  const activeCv = await getActiveCv();
  if (activeCv) {
    try {
      const result = await readActiveCvBytes(activeCv);
      if (result) {
        return pdfResponse(
          result.buffer,
          result.originalName || activeCv.filename || "CV.pdf",
        );
      }
    } catch (e) {
      // File missing / fetch failed — fall through to generated fallback
      // eslint-disable-next-line no-console
      console.error("[cv/view] uploaded file read failed:", e.message);
    }
  }

  // 2) Fallback: generate an ATS-friendly PDF from online CV data
  try {
    const data = await getData();
    const pdfBytes = await buildAtsCvFromData(data);
    const filename = `${data.profile?.name || "CV"} - Resume.pdf`;
    return pdfResponse(pdfBytes, filename);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "Unable to produce a CV: " + e.message },
      { status: 500 },
    );
  }
}
