import { getData } from "@/lib/db";
import { getActiveCv } from "@/lib/publicFiles";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/portfolio  -> full portfolio data (async)
export async function GET() {
  const data = await getData();
  // Attach the standalone downloadable CV URL (kept separate from cv_text).
  const activeCv = await getActiveCv();
  const downloadCv = activeCv
    ? {
        url: activeCv.url,
        originalName: activeCv.original_name,
        uploadedAt: activeCv.uploaded_at,
      }
    : null;
  return NextResponse.json({ ...data, downloadCv });
}
