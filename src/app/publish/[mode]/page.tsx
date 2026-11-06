import { redirect } from "next/navigation";
import { PublishForm } from "@/components/publish-form";
import { modeFromSlug } from "@/lib/modes";
import { getSession } from "@/lib/session";

export default async function PublishPage({ params }: { params: Promise<{ mode: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const mode = modeFromSlug((await params).mode);
  if (!mode) redirect("/");

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <PublishForm mode={mode} />
    </div>
  );
}
