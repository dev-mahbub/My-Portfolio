import { Pool } from "pg";

/**
 * PostgreSQL connection pool (singleton).
 *
 * Connection is configured from DATABASE_URL env var.
 * If DATABASE_URL is missing or invalid, the app gracefully falls back
 * to the filesystem JSON store (lib/jsonStore.js) so the UI never breaks.
 */

let pool = null;
let poolError = null;
let warned = false;

/**
 * Decide whether to enable SSL for the Postgres connection.
 *
 * Neon and most managed Postgres providers require SSL. We enable it
 * whenever the URL asks for it (sslmode=require/verify-ca/verify-full) or
 * when connecting to a non-local host. We use a permissive TLS config
 * (rejectUnauthorized: false) to stay compatible with providers that use
 * internal/self-signed CAs (e.g. Neon).
 */
function resolveSsl(url) {
  const wantsSsl = /sslmode\s*=\s*(require|verify-ca|verify-full)/i.test(url);
  const isRemote = !/localhost|127\.0\.0\.1|0\.0\.0\.0/.test(url);
  return wantsSsl || isRemote ? { rejectUnauthorized: false } : false;
}

function createPool() {
  const url = process.env.DATABASE_URL;
  if (!url || url.includes("YOUR_PASSWORD")) {
    poolError = new Error("DATABASE_URL is not configured");
    return null;
  }
  try {
    const p = new Pool({
      connectionString: url,
      max: 8,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: resolveSsl(url),
    });
    // Fail fast on bad config during first connect.
    p.on("error", (err) => {
      // eslint-disable-next-line no-console
      console.error("[pg] pool error:", err.message);
    });
    return p;
  } catch (e) {
    poolError = e;
    return null;
  }
}

/**
 * Get the shared pool (lazy init). Returns null if unconfigured.
 */
export function getPool() {
  if (!pool && !poolError) {
    pool = createPool();
    if (pool && !warned) {
      warned = true;
    }
  }
  return pool;
}

/**
 * Whether Postgres is configured (DATABASE_URL present & not the placeholder).
 */
export function isDbConfigured() {
  const url = process.env.DATABASE_URL;
  return Boolean(url && !url.includes("YOUR_PASSWORD"));
}

/**
 * Run a query. Throws if DB is unavailable.
 */
export async function query(text, params) {
  const p = getPool();
  if (!p) throw poolError || new Error("Database not configured");
  return p.query(text, params);
}

/**
 * Check connectivity. Returns { ok, error }.
 */
export async function pingDb() {
  try {
    const res = await query("SELECT NOW() as now");
    return { ok: true, now: res.rows[0].now };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export default { getPool, query, pingDb, isDbConfigured };
