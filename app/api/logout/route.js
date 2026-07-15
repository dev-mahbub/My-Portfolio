import { SESSION_COOKIE_NAME, clearSessionCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/logout
export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
