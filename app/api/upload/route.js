import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { setActiveCv } from "@/lib/publicFiles";
import { query, isDbConfigured } from "@/lib/pg";

export const dynamic = "force-dynamic";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const ALLOWED = {
  cv: ["application/pdf"],
  cover: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  avatar: ["image/jpeg", "image/png", "image/webp"],
};

function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Save an uploaded file.
 *
 * Storage priority (serverless-safe first):
 *   1. Vercel Blob (if BLOB_READ_WRITE_TOKEN is set)
 *   2. PostgreSQL `uploads` table as BYTEA (when DB is configured — the
 *      default on Vercel; no extra setup needed beyond the migration)
 *   3. Local filesystem `public/uploads` (dev only)
 *
 * @returns {Promise<{url: string, name: string, buffer: Buffer}>}
 */
async function saveFile(file, type, userId) {
  const safeName = String(file.name).replace(/[^a-zA-Z0-9._-]/g, "_");
  const unique = `${Date.now()}-${safeName}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = file.type || "application/octet-stream";

  // 1) Vercel Blob (optional, if store connected)
  if (isBlobConfigured()) {
    const pathname =
      type === "cv"
        ? `cv/${unique}`
        : type === "avatar"
          ? `avatars/${unique}`
          : `images/${unique}`;
    const blob = await put(pathname, buffer, {
      access: "public",
      contentType: mimeType,
      addRandomSuffix: false,
    });
    return { url: blob.url, name: unique, buffer };
  }

  // 2) PostgreSQL (default on Vercel — works with Neon, no extra setup)
  if (isDbConfigured()) {
    const res = await query(
      `INSERT INTO uploads (kind, filename, original_name, mime_type, size_bytes, data, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        type || "image",
        unique,
        file.name,
        mimeType,
        buffer.length,
        buffer,
        userId ?? null,
      ],
    );
    const id = res.rows[0]?.id;
    return { url: `/api/file/${id}`, name: unique, buffer };
  }

  // 3) Local filesystem (dev only). On Vercel this throws EROFS.
  if (!fs.existsSync(UPLOADS_DIR))
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const dest = path.join(UPLOADS_DIR, unique);
  try {
    fs.writeFileSync(dest, buffer);
  } catch (e) {
    if (
      e &&
      (e.code === "EROFS" || e.code === "EACCES" || e.code === "EPERM")
    ) {
      const err = new Error(
        "Uploads are not configured on this server. Either (a) connect a " +
          "Vercel Blob store (Project → Storage → Create → Blob → Connect) " +
          "so BLOB_READ_WRITE_TOKEN is set, or (b) make sure DATABASE_URL is " +
          "set so files can be stored in PostgreSQL. Error: " +
          e.code,
      );
      err.code = "NO_STORAGE_CONFIGURED";
      throw err;
    }
    throw e;
  }
  return { url: `/uploads/${unique}`, name: unique, buffer };
}

// POST /api/upload  (multipart/form-data) — auth required
// fields:
//   - file: File (the uploaded file)
//   - type: "cv" | "cover" | "avatar"  (optional, for foldering)
export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const form = await request.formData();
    const file = form.get("file");
    const type = (form.get("type") || "cover").toString();

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ctype = file.type || "";
    const allowedTypes = ALLOWED[type] || ALLOWED.cover;
    if (!allowedTypes.includes(ctype)) {
      return NextResponse.json(
        { error: "File type not allowed: " + ctype },
        { status: 400 },
      );
    }

    // Resolve user id (used for both uploads table FK and public_files FK)
    const user = await getCurrentUser();
    const userId = user?.sub ? Number(user.sub) || null : null;

    const {
      url: publicUrl,
      name: storedName,
      buffer,
    } = await saveFile(file, type, userId);

    // ===== Dual-CV Isolation =====
    // When a CV PDF is uploaded, register it as the standalone
    // downloadable CV in public_files (separate from online CV text).
    if (type === "cv") {
      await setActiveCv({
        filename: storedName,
        originalName: file.name,
        url: publicUrl,
        mimeType: ctype,
        sizeBytes: buffer.length,
        userId,
      });
    }

    return NextResponse.json({ ok: true, url: publicUrl, name: storedName });
  } catch (e) {
    const status = e.code === "NO_STORAGE_CONFIGURED" ? 503 : 500;
    return NextResponse.json(
      { error: "Upload failed: " + e.message },
      {
        status,
      },
    );
  }
}
