import { getData } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { getActiveCv } from "@/lib/publicFiles";
import Dashboard from "@/components/Dashboard";

export const dynamic = "force-dynamic";

/**
 * /dashboard — admin-only page.
 * Renders the Dashboard component with server-loaded data + auth state.
 * The Dashboard component also guards client-side (redirects visitors to "/").
 */
export default async function DashboardPage() {
  const authed = await isAuthenticated();

  // Server-side guard: if not authed, the component will redirect to "/"
  if (!authed) {
    return <Dashboard initialData={{}} initialAuthed={false} />;
  }

  const data = await getData();
  const activeCv = await getActiveCv();
  const downloadCv = activeCv
    ? {
        url: activeCv.url,
        originalName: activeCv.original_name,
        uploadedAt: activeCv.uploaded_at,
      }
    : null;

  return (
    <Dashboard initialData={{ ...data, downloadCv }} initialAuthed={true} />
  );
}
