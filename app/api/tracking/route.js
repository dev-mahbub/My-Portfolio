import { NextResponse } from "next/server";
import { logVisit } from "@/lib/tracking";
import { getRequestIp } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/tracking
 * body: { path, ref?, sessionId? }
 *
 * Logs a public visit. Called by the public page on load (fire-and-forget).
 * Captures: timestamp (DB default), user-agent (server header),
 *           IP (best-effort), ref (?ref=google), path.
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const ua = request.headers.get("user-agent") || "";
    const ip = await getRequestIp();
    const ref =
      body.ref ||
      new URL(
        body.path || "/",
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost",
      ).searchParams.get("ref") ||
      null;

    await logVisit({
      ip,
      userAgent: ua,
      refSource: ref,
      path: body.path || null,
      sessionId: body.sessionId || null,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
