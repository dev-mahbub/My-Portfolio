import { cookies, headers } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { query, isDbConfigured } from "@/lib/pg";

/**
 * Authentication layer.
 *
 * - Primary:   PostgreSQL `users` table + bcrypt password hashes.
 * - Fallback:  hardcoded demo creds (below) when DB is not configured.
 *
 * Session = signed HMAC token stored in an httpOnly cookie (JWT-style).
 */

const SESSION_COOKIE = "portfolio_session";
const SECRET =
  process.env.AUTH_SECRET || "portfolio-demo-secret-change-me-please";

// Fallback demo credentials (only used when DB is unavailable)
const FALLBACK_USERNAME = "admin";
const FALLBACK_EMAIL = "mahbub.devs@gmail.com";
const FALLBACK_PASSWORD = "adminpass123";

/* ----------------------------- token helpers ---------------------------- */

function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== "string") return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(body)
    .digest("base64url");
  if (
    expected.length !== sig.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
  ) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}

export function createSession(user) {
  const payload = {
    sub: String(user.id ?? user.username),
    username: user.username,
    email: user.email,
    role: user.role || "admin",
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  };
  return signToken(payload);
}

/* ------------------------------- cookies -------------------------------- */

export function getSessionCookie() {
  const store = cookies();
  return store.get(SESSION_COOKIE)?.value || null;
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

/* ------------------------------ credential ------------------------------ */

/**
 * Verify credentials against DB (bcrypt) or fallback.
 * Accepts either `username` or `email` as the `username` field.
 */
export async function verifyCredentials(usernameOrEmail, password) {
  const id = String(usernameOrEmail || "").trim();
  if (!id || !password) return null;

  // Fallback (no DB)
  if (!isDbConfigured()) {
    const isUser =
      id.toLowerCase() === FALLBACK_USERNAME.toLowerCase() ||
      id.toLowerCase() === FALLBACK_EMAIL.toLowerCase();
    if (isUser && password === FALLBACK_PASSWORD) {
      return {
        id: 0,
        username: FALLBACK_USERNAME,
        email: FALLBACK_EMAIL,
        role: "admin",
      };
    }
    return null;
  }

  try {
    const res = await query(
      `SELECT id, username, email, password_hash, role
       FROM users
       WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)
       LIMIT 1`,
      [id],
    );
    if (res.rowCount === 0) return null;
    const u = res.rows[0];
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return null;
    return {
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role || "admin",
    };
  } catch {
    return null;
  }
}

/**
 * Change admin credentials (username + password) in the DB.
 * @returns {Promise<{ok:boolean, error?:string, user?:object}>}
 */
export async function changeCredentials(userId, newUsername, newPassword) {
  if (!isDbConfigured()) {
    return { ok: false, error: "Database not configured (demo mode)" };
  }
  const uname = String(newUsername || "").trim();
  if (uname.length < 3) {
    return { ok: false, error: "Username must be at least 3 characters" };
  }
  if (!newPassword || newPassword.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters" };
  }

  try {
    const hash = await bcrypt.hash(newPassword, 10);
    const dup = await query(
      `SELECT id FROM users WHERE LOWER(username) = LOWER($1) AND id <> $2`,
      [uname, userId],
    );
    if (dup.rowCount > 0) {
      return { ok: false, error: "Username already taken" };
    }
    const res = await query(
      `UPDATE users SET username = $1, password_hash = $2 WHERE id = $3
       RETURNING id, username, email, role`,
      [uname, hash, userId],
    );
    if (res.rowCount === 0) return { ok: false, error: "User not found" };
    return { ok: true, user: res.rows[0] };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/* ------------------------------- session -------------------------------- */

export async function isAuthenticated() {
  const payload = await getCurrentUser();
  if (!payload) return false;
  if (payload.exp && Date.now() > payload.exp) return false;
  return payload.role === "admin";
}

export async function getCurrentUser() {
  const token = getSessionCookie();
  const payload = verifyToken(token);
  if (!payload) return null;
  if (payload.exp && Date.now() > payload.exp) return null;
  return payload;
}

/**
 * Extract the requester's IP from Next.js headers (best effort).
 */
export async function getRequestIp() {
  try {
    const h = headers();
    return (
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      null
    );
  } catch {
    return null;
  }
}

/**
 * Helper: set/clear the session cookie on a NextResponse.
 */
export function attachSessionCookie(res, token) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie(res) {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
