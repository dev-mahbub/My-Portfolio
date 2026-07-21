import { NextResponse } from "next/server";
import { query, isDbConfigured } from "@/lib/pg";

export const dynamic = "force-dynamic";

/**
 * GET /api/file/[id]
 *
 * Serves an uploaded file's raw bytes from the PostgreSQL `uploads` table.
 * This is the serverless-safe way to serve user-uploaded files (the
 * filesystem on Vercel is read-only, so files are stored in DB as BYTEA).
 *
 * Returns the file with its original Content-Type and a Content-Disposition
 * of "inline" so images render in <img>/<next/image> and PDFs open in-tab.
 */
export async function GET(request, { params }) {
  const id = Number(params?.id);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid file id" }, { status: 400 });
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 },
    );
  }

  let row;
  try {
    const res = await query(
      `SELECT filename, original_name, mime_type, data
       FROM uploads
       WHERE id = $1
       LIMIT 1`,
      [id],
    );
    row = res.rows[0];
  } catch (e) {
    return NextResponse.json(
      { error: "Database error: " + e.message },
      { status: 500 },
    );
  }

  if (!row) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // data comes back as a Buffer when using node-postgres
  const bytes = Buffer.isBuffer(row.data) ? row.data : Buffer.from(row.data);

  const contentType = row.mime_type || "application/octet-stream";
  const downloadName = row.original_name || row.filename || "file";

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(bytes.length),
      "Content-Disposition": `inline; filename="${downloadName.replace(/[^\x20-\x7E]/g, "")}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
