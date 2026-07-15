import { NextResponse } from "next/server";
import {
  isAuthenticated,
  getCurrentUser,
  changeCredentials,
  verifyCredentials,
  createSession,
  attachSessionCookie,
} from "@/lib/auth";
import { isDbConfigured } from "@/lib/pg";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/credentials
 * body: { currentPassword, newUsername, newPassword }
 *
 * Securely change the admin username + password.
 * Requires the current session AND the current password (re-verification).
 */
export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { currentPassword, newUsername, newPassword } = body;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!currentPassword || !newUsername || !newPassword) {
    return NextResponse.json(
      { error: "currentPassword, newUsername, and newPassword are required" },
      { status: 400 },
    );
  }

  // Re-verify the current password before allowing a change
  const recheck = await verifyCredentials(user.username, currentPassword);
  if (!recheck) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 403 },
    );
  }

  const result = await changeCredentials(
    Number(user.sub),
    newUsername,
    newPassword,
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Re-issue the session cookie with the new username
  const token = createSession(result.user);
  const res = NextResponse.json({
    ok: true,
    username: result.user.username,
    email: result.user.email,
    dbConfigured: isDbConfigured(),
  });
  attachSessionCookie(res, token);
  return res;
}
