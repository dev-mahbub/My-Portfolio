/**
 * Filesystem JSON store — FALLBACK when PostgreSQL is not configured.
 *
 * This preserves the original behaviour so the app still runs out-of-the-box
 * (e.g. in demos / CI) without a database. When DATABASE_URL is set, the
 * Postgres-backed lib/db.js is used instead and this module is not invoked.
 *
 * IMPORTANT (serverless safety): On read-only filesystems (e.g. Vercel), any
 * write/mkdir attempt will throw EROFS. All FS operations here are wrapped so
 * that such failures degrade gracefully to in-memory seed data instead of
 * crashing the request.
 */

import fs from "fs";
import path from "path";
import { SEED_DATA } from "@/lib/seedData";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "portfolio.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// In-memory mirror used when the filesystem is read-only (e.g. Vercel).
let memoryStore = null;

function isReadOnlyFsError(e) {
  return (
    e &&
    (e.code === "EROFS" ||
      e.code === "ENOTDIR" ||
      e.code === "EACCES" ||
      e.code === "EPERM" ||
      e.code === "ENOSPC")
  );
}

/**
 * Best-effort: ensure the data dirs + file exist. Never throws on read-only
 * filesystems; instead we switch to the in-memory store.
 */
function ensureStore() {
  if (memoryStore) return;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(UPLOADS_DIR))
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(SEED_DATA, null, 2), "utf-8");
    }
  } catch (e) {
    if (isReadOnlyFsError(e)) {
      // Read-only environment (Vercel/serverless) — use in-memory seed data.
      // eslint-disable-next-line no-console
      console.warn(
        "[jsonStore] filesystem not writable, using in-memory store:",
        e.code || e.message,
      );
      memoryStore = { ...SEED_DATA };
    } else {
      throw e;
    }
  }
}

export function readJsonStore() {
  ensureStore();
  if (memoryStore) return memoryStore;
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
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
  if (memoryStore) {
    memoryStore = data;
    return data;
  }
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    if (isReadOnlyFsError(e)) {
      memoryStore = data; // switch to in-memory for the rest of this instance
    } else {
      throw e;
    }
  }
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
