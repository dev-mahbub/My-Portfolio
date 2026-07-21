import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { setActiveCv } from "@/lib/publicFiles";

export const dynamic = "force-dynamic";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const ALLOWED = {
  cv: ["application/pdf"],
  cover: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  avatar: ["image/jpeg", "image/png", "image/webp"],
};

/**
 * Whether Vercel Blob is configured. When true we upload to Blob storage
 * (required on Vercel/serverless where the filesystem is read-only).
 * When false (local dev without a Blob token) we fall back to disk.
 */
function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Save a file. Uses Vercel Blob in production, falls back to the local
 * `public/uploads` directory in development.
 *
 * @returns {Promise<{url: string, name: string, buffer: Buffer}>}
 */
async function saveFile(file, type) {
  const safeName = String(file.name).replace(/[^a-zA-Z0-9._-]/g, "_");
  const unique = `${Date.now()}-${safeName}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (isBlobConfigured()) {
    const pathname =
      type === "cv"
        ? `cv/${unique}`
        : type === "avatar"
          ? `avatars/${unique}`
          : `images/${unique}`;
    const blob = await put(pathname, buffer, {
      access: "public",
      contentType: file.type || undefined,
      addRandomSuffix: false,
    });
    return { url: blob.url, name: unique, buffer };
  }

  // Local filesystem fallback (dev only)
  if (!fs.existsSync(UPLOADS_DIR))
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const dest = path.join(UPLOADS_DIR, unique);
  fs.writeFileSync(dest, buffer);
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

    const {
      url: publicUrl,
      name: storedName,
      buffer,
    } = await saveFile(file, type);

    // ===== Dual-CV Isolation =====
    // When a CV PDF is uploaded, register it as the standalone
    // downloadable CV in public_files (separate from online CV text).
    if (type === "cv") {
      const user = await getCurrentUser();
      const userId = user?.sub ? Number(user.sub) || null : null;
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
    return NextResponse.json(
      { error: "Upload failed: " + e.message },
      { status: 500 },
    );
  }
}
