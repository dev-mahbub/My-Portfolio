import {
  verifyCredentials,
  createSession,
  isAuthenticated,
  attachSessionCookie,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/login  body: { username | email, password }
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const id = body.username || body.email;
  const user = await verifyCredentials(id, body.password);

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Invalid username or password" },
      { status: 401 },
    );
  }

  const token = createSession(user);
  const res = NextResponse.json({
    ok: true,
    username: user.username,
    email: user.email,
  });
  attachSessionCookie(res, token);
  // Keep alias cookie name for any legacy code (same value)
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

// GET /api/login -> current auth status
export async function GET() {
  return NextResponse.json({ authenticated: await isAuthenticated() });
}
