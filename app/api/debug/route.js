import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/debug
 * Returns which storage env vars are configured (values are NOT exposed).
 * Helps diagnose upload/storage issues on Vercel.
 */
export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  const authSecret = process.env.AUTH_SECRET;

  return NextResponse.json({
    storage: {
      DATABASE_URL: dbUrl ? "SET ✓" : "MISSING ✗",
      DATABASE_URL_has_placeholder: dbUrl
        ? dbUrl.includes("YOUR_PASSWORD")
        : "n/a",
      BLOB_READ_WRITE_TOKEN: blobToken ? "SET ✓" : "MISSING ✗",
    },
    auth: {
      AUTH_SECRET: authSecret ? "SET ✓" : "MISSING ✗",
    },
    storageStrategy: blobToken
      ? "vercel-blob"
      : dbUrl && !dbUrl.includes("YOUR_PASSWORD")
        ? "postgresql"
        : "local-fs (WILL FAIL on Vercel)",
  });
}
