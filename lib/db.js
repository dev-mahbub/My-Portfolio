/**
 * Data Access Layer for portfolio content.
 *
 * Primary store: PostgreSQL (dashboard_content table, JSONB per section).
 * Fallback store: filesystem JSON (lib/jsonStore.js) when DATABASE_URL
 *                 is not configured, so the app always runs.
 *
 * All functions are async to support the DB path.
 */

import { query, isDbConfigured } from "@/lib/pg";
import { readJsonStore, updateJsonSection } from "@/lib/jsonStore";
import { SEED_DATA } from "@/lib/seedData";

/**
 * Build the legacy aggregate object from DB rows.
 * Merges DB rows over seed defaults so every section always exists.
 */
function mergeFromRows(rows) {
  const out = { ...SEED_DATA };
  for (const r of rows) {
    out[r.section] = r.value;
  }
  // ensure nested objects survive even if a row stored a partial
  out.profile = { ...SEED_DATA.profile, ...(out.profile || {}) };
  out.contact = { ...SEED_DATA.contact, ...(out.contact || {}) };
  return out;
}

/**
 * Get all portfolio data (aggregate).
 * @returns {Promise<object>}
 */
export async function getData() {
  if (!isDbConfigured()) {
    return readJsonStore();
  }
  try {
    const res = await query("SELECT section, value FROM dashboard_content");
    if (res.rows.length === 0) {
      // DB configured but empty — fall back to seed so UI isn't blank
      return { ...SEED_DATA };
    }
    return mergeFromRows(res.rows);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[db] getData failed, using JSON fallback:", e.message);
    return readJsonStore();
  }
}

/**
 * Update a single section (auth required upstream).
 * @param {string} section
 * @param {*} value
 * @param {number|null} userId
 * @returns {Promise<object>} full updated data
 */
export async function updateSection(section, value, userId = null) {
  if (!isDbConfigured()) {
    return updateJsonSection(section, value);
  }
  try {
    await query(
      `INSERT INTO dashboard_content (section, value, updated_by)
       VALUES ($1, $2::jsonb, $3)
       ON CONFLICT (section) DO UPDATE
         SET value = EXCLUDED.value,
             updated_by = EXCLUDED.updated_by`,
      [section, JSON.stringify(value), userId],
    );
    return getData();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[db] updateSection failed:", e.message);
    return updateJsonSection(section, value);
  }
}

/**
 * Get a single section value.
 */
export async function getSection(section) {
  if (!isDbConfigured()) {
    return readJsonStore()[section];
  }
  try {
    const res = await query(
      "SELECT value FROM dashboard_content WHERE section = $1",
      [section],
    );
    if (res.rowCount === 0) return SEED_DATA[section];
    return res.rows[0].value;
  } catch {
    return readJsonStore()[section];
  }
}

export const ALLOWED_SECTIONS = [
  "profile",
  "skills",
  "projects",
  "experience",
  "education",
  "highlights",
  "contact",
  "languages",
  "cv_text",
  "cover_letter",
];

export default { getData, getSection, updateSection, ALLOWED_SECTIONS };
