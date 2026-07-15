import { NextResponse } from "next/server";
import { getActiveCv } from "@/lib/publicFiles";
import { getData } from "@/lib/db";
import { buildAtsCvFromData } from "@/lib/cvPdf";

export const dynamic = "force-dynamic";

/**
 * GET /api/cv/download
 *
 * Dual-CV Isolation:
 *   Serves the STANDALONE downloadable CV (from public_files),
 *   which is completely separate from the editable online CV text
 *   stored in dashboard_content.
 *
 *   Priority:
 *     1. Active PDF uploaded from the dashboard (public_files)
 *     2. On-the-fly ATS-friendly PDF generated from the ONLINE CV data
 *        (fallback so a downloadable file always exists; this fallback
 *         DOES NOT modify the stored data and is still ATS-friendly).
 */
export async function GET() {
  // 1) Try the standalone uploaded PDF
  const activeCv = await getActiveCv();
  if (activeCv) {
    return NextResponse.json({
      ok: true,
      source: "uploaded",
      url: activeCv.url,
      originalName: activeCv.original_name,
      uploadedAt: activeCv.uploaded_at,
    });
  }

  // 2) Fallback: generate an ATS-friendly PDF from online CV data
  try {
    const data = await getData();
    const pdfBytes = await buildAtsCvFromData(data);
    const base64 = Buffer.from(pdfBytes).toString("base64");
    return NextResponse.json({
      ok: true,
      source: "generated",
      mimeType: "application/pdf",
      filename: `${data.profile?.name || "CV"} - ATS Resume.pdf`,
      base64,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "Unable to produce a CV: " + e.message },
      { status: 500 },
    );
  }
}
