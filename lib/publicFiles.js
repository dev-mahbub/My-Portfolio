import { query, isDbConfigured } from "@/lib/pg";

/**
 * public_files layer — the STANDALONE downloadable CV.
 *
 * IMPORTANT (Dual-CV Isolation):
 *   - This data lives in `public_files` and is 100% separate from the
 *     editable online CV text stored in `dashboard_content`.
 *   - Editing online CV text never touches the PDF record.
 *   - Uploading a new PDF never touches the online CV text.
 */

/**
 * Get the currently active downloadable CV (or null).
 */
export async function getActiveCv() {
  if (!isDbConfigured()) return null;
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
    return { ok: false, enabled: false };
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
