import { query, isDbConfigured } from "@/lib/pg";

/**
 * Visitor tracking layer (visitor_tracking table).
 * No-op when DB is not configured.
 */

/**
 * Log a visit.
 * @param {object} v { ip, userAgent, refSource, path, sessionId }
 */
export async function logVisit(v = {}) {
  if (!isDbConfigured()) return { ok: false, tracked: false };
  try {
    await query(
      `INSERT INTO visitor_tracking (ip_address, user_agent, ref_source, path, session_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        (v.ip || "").slice(0, 64) || null,
        (v.userAgent || "").slice(0, 512) || null,
        (v.refSource || "").slice(0, 128) || null,
        (v.path || "").slice(0, 512) || null,
        (v.sessionId || "").slice(0, 64) || null,
      ],
    );
    return { ok: true, tracked: true };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[tracking] logVisit failed:", e.message);
    return { ok: false, tracked: false, error: e.message };
  }
}

/**
 * Aggregate analytics for the admin dashboard.
 */
export async function getAnalytics() {
  if (!isDbConfigured()) {
    return {
      enabled: false,
      total: 0,
      uniqueRefs: 0,
      byRef: [],
      byDay: [],
      byPath: [],
      recent: [],
      byDevice: { desktop: 0, mobile: 0, bot: 0, other: 0 },
    };
  }
  try {
    const total = await query(
      "SELECT COUNT(*)::int AS n FROM visitor_tracking",
    );
    const refs = await query(
      `SELECT COUNT(DISTINCT ref_source)::int AS n FROM visitor_tracking
       WHERE ref_source IS NOT NULL AND ref_source <> ''`,
    );
    const byRef = await query(
      `SELECT COALESCE(NULLIF(ref_source,''),'direct') AS ref, COUNT(*)::int AS visits
       FROM visitor_tracking GROUP BY ref_source ORDER BY visits DESC LIMIT 20`,
    );
    const byDay = await query(
      `SELECT to_char(date_trunc('day', visited_at), 'YYYY-MM-DD') AS day,
              COUNT(*)::int AS visits
       FROM visitor_tracking
       WHERE visited_at > NOW() - INTERVAL '30 days'
       GROUP BY day ORDER BY day ASC`,
    );
    const byPath = await query(
      `SELECT COALESCE(NULLIF(path,''),'/') AS path, COUNT(*)::int AS visits
       FROM visitor_tracking GROUP BY path ORDER BY visits DESC LIMIT 20`,
    );
    const recent = await query(
      `SELECT id, visited_at, ip_address, user_agent, ref_source, path
       FROM visitor_tracking ORDER BY visited_at DESC LIMIT 50`,
    );

    const deviceCounts = { desktop: 0, mobile: 0, bot: 0, other: 0 };
    for (const r of recent.rows) {
      const ua = (r.user_agent || "").toLowerCase();
      if (
        /bot|crawl|spider|slurp|baidu|bingpreview|facebookexternalhit/.test(ua)
      )
        deviceCounts.bot++;
      else if (
        /mobile|android|iphone|ipod|blackberry|opera mini|iemobile/.test(ua)
      )
        deviceCounts.mobile++;
      else if (/windows|macintosh|linux|x11/.test(ua)) deviceCounts.desktop++;
      else deviceCounts.other++;
    }

    return {
      enabled: true,
      total: total.rows[0]?.n || 0,
      uniqueRefs: refs.rows[0]?.n || 0,
      byRef: byRef.rows,
      byDay: byDay.rows,
      byPath: byPath.rows,
      recent: recent.rows,
      byDevice: deviceCounts,
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[tracking] getAnalytics failed:", e.message);
    return {
      enabled: false,
      error: e.message,
      total: 0,
      uniqueRefs: 0,
      byRef: [],
      byDay: [],
      byPath: [],
      recent: [],
      byDevice: { desktop: 0, mobile: 0, bot: 0, other: 0 },
    };
  }
}

export default { logVisit, getAnalytics };
