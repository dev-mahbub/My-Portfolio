import { getData } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import Portfolio from "@/components/Portfolio";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getData();
  const authed = await isAuthenticated();
  return <Portfolio initialData={data} initialAuthed={authed} />;
}
