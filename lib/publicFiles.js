import fs from "fs";
import path from "path";
import { query, isDbConfigured } from "@/lib/pg";

/**
 * public_files layer — the STANDALONE downloadable CV.
 *
 * IMPORTANT (Dual-CV Isolation):
 *   - This data lives in `public_files` and is 100% separate from the
 *     editable online CV text stored in `dashboard_content`.
 *   - Editing online CV text never touches the PDF record.
 *   - Uploading a new PDF never touches the online CV text.
 *
 * Storage strategy (mirrors lib/db.js):
 *   - Primary:  PostgreSQL `public_files` table (when DATABASE_URL is set)
 *   - Fallback: filesystem JSON file `data/active_cv.json`
 *               (so the app works out-of-the-box without a database)
 */

const DATA_DIR = path.join(process.cwd(), "data");
const CV_FILE = path.join(DATA_DIR, "active_cv.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJsonCv() {
  try {
    ensureDataDir();
    if (!fs.existsSync(CV_FILE)) return null;
    const raw = fs.readFileSync(CV_FILE, "utf-8");
    const obj = JSON.parse(raw);
    if (!obj || !obj.url) return null;
    // Normalize to the SAME shape returned by the DB query, so callers
    // (the API routes) don't need to care which store is in use.
    return {
      id: obj.id ?? null,
      filename: obj.filename ?? null,
      original_name: obj.originalName ?? obj.original_name ?? null,
      url: obj.url,
      mime_type: obj.mimeType ?? obj.mime_type ?? "application/pdf",
      size_bytes: obj.sizeBytes ?? obj.size_bytes ?? null,
      uploaded_at: obj.uploadedAt ?? obj.uploaded_at ?? null,
    };
  } catch {
    return null;
  }
}

function writeJsonCv(rec) {
  try {
    ensureDataDir();
    fs.writeFileSync(CV_FILE, JSON.stringify(rec, null, 2), "utf-8");
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[publicFiles] writeJsonCv failed:", e.message);
  }
}

/**
 * Get the currently active downloadable CV (or null).
 */
export async function getActiveCv() {
  if (!isDbConfigured()) {
    return readJsonCv();
  }
  try {
    const res = await query(
      `SELECT id, filename, original_name, url, mime_type, size_bytes, uploaded_at
       FROM public_files
       WHERE kind = 'cv' AND is_active = TRUE
       ORDER BY uploaded_at DESC LIMIT 1`,
    );
    return res.rows[0] || null;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[publicFiles] getActiveCv failed:", e.message);
    return null;
  }
}

/**
 * Register a newly uploaded PDF as the active downloadable CV.
 * Deactivates previous active CVs.
 */
export async function setActiveCv({
  filename,
  originalName,
  url,
  mimeType,
  sizeBytes,
  userId,
}) {
  if (!isDbConfigured()) {
    const uploadedAt = new Date().toISOString();
    const record = {
      id: Date.now(),
      filename,
      originalName,
      url,
      mimeType: mimeType || "application/pdf",
      sizeBytes: sizeBytes ?? null,
      uploadedAt,
    };
    writeJsonCv(record);
    return {
      ok: true,
      enabled: false,
      file: { id: record.id, url, uploadedAt },
    };
  }
  try {
    await query(`UPDATE public_files SET is_active = FALSE WHERE kind = 'cv'`);
    const res = await query(
      `INSERT INTO public_files
         (kind, filename, original_name, url, mime_type, size_bytes, is_active, uploaded_by)
       VALUES ('cv', $1, $2, $3, $4, $5, TRUE, $6)
       RETURNING id, url, uploaded_at`,
      [
        filename,
        originalName,
        url,
        mimeType || "application/pdf",
        sizeBytes ?? null,
        userId ?? null,
      ],
    );
    return { ok: true, enabled: true, file: res.rows[0] };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[publicFiles] setActiveCv failed:", e.message);
    return { ok: false, enabled: true, error: e.message };
  }
}

export default { getActiveCv, setActiveCv };
