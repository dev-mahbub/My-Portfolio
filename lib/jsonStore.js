/**
 * Filesystem JSON store — FALLBACK when PostgreSQL is not configured.
 *
 * This preserves the original behaviour so the app still runs out-of-the-box
 * (e.g. in demos / CI) without a database. When DATABASE_URL is set, the
 * Postgres-backed lib/db.js is used instead and this module is not invoked.
 */

import fs from "fs";
import path from "path";
import { SEED_DATA } from "@/lib/seedData";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "portfolio.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR))
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(SEED_DATA, null, 2), "utf-8");
  }
}

export function readJsonStore() {
  ensureStore();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    // ensure new sections exist on old files
    return {
      ...SEED_DATA,
      ...parsed,
      profile: { ...SEED_DATA.profile, ...(parsed.profile || {}) },
      contact: { ...SEED_DATA.contact, ...(parsed.contact || {}) },
    };
  } catch {
    return SEED_DATA;
  }
}

export function writeJsonStore(data) {
  ensureStore();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  return data;
}

export function updateJsonSection(section, value) {
  const data = readJsonStore();
  if (
    [
      "skills",
      "projects",
      "experience",
      "education",
      "highlights",
      "languages",
    ].includes(section)
  ) {
    data[section] = value;
  } else if (typeof value === "object" && section in data) {
    data[section] = { ...data[section], ...value };
  } else {
    data[section] = value;
  }
  writeJsonStore(data);
  return data;
}

export default { readJsonStore, writeJsonStore, updateJsonSection };
