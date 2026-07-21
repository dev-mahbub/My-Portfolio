import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getActiveCv } from "@/lib/publicFiles";
import { getData } from "@/lib/db";
import { buildAtsCvFromData } from "@/lib/cvPdf";

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
 *      - stored in Vercel Blob (absolute URL) on production
 *      - stored in public/uploads (relative path) on local dev
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
 * Resolve the active CV bytes.
 * - If the URL is absolute (Vercel Blob / remote storage), fetch it.
 * - Otherwise treat it as a relative path under /public (local dev only).
 * @returns {Promise<Buffer|null>}
 */
async function readActiveCvBytes(activeCv) {
  if (!activeCv?.url) return null;

  if (/^https?:\/\//i.test(activeCv.url)) {
    // Remote (Vercel Blob)
    const upstream = await fetch(activeCv.url);
    if (!upstream.ok) {
      throw new Error(
        `Blob fetch failed: ${upstream.status} ${upstream.statusText}`,
      );
    }
    return Buffer.from(await upstream.arrayBuffer());
  }

  // Local filesystem (dev)
  const filePath = path.join(process.cwd(), "public", activeCv.url);
  return fs.readFile(filePath);
}

export async function GET() {
  // 1) Try the standalone uploaded PDF
  const activeCv = await getActiveCv();
  if (activeCv) {
    try {
      const fileBuffer = await readActiveCvBytes(activeCv);
      return pdfResponse(
        fileBuffer,
        activeCv.original_name || activeCv.filename || "CV.pdf",
      );
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
