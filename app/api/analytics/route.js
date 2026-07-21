import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getAnalytics } from "@/lib/tracking";

export const dynamic = "force-dynamic";

/**
 * GET /api/analytics
 *
 * Admin-only. Returns aggregated visitor analytics
 * (total visits, ref sources, device breakdown, recent visits).
 */
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await getAnalytics();
  return NextResponse.json(data);
}
