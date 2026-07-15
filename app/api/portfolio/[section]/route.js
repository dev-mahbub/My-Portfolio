import { updateSection, ALLOWED_SECTIONS } from "@/lib/db";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// PUT /api/portfolio/[section]  -> update one section (auth required)
// body: { value: ... }
export async function PUT(request, { params }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { section } = params;
  const body = await request.json().catch(() => ({}));

  if (!ALLOWED_SECTIONS.includes(section)) {
    return NextResponse.json(
      { error: "Unknown section: " + section },
      { status: 400 },
    );
  }

  const user = await getCurrentUser();
  const userId = user?.sub ? Number(user.sub) || null : null;
  const updated = await updateSection(section, body.value, userId);
  return NextResponse.json({ ok: true, data: updated });
}
