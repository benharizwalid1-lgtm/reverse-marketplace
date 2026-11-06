"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { PublishForm } from "@/components/publish-form";
import { modeFromSlug } from "@/lib/modes";
import { useStore } from "@/lib/store";

export default function PublishPage() {
  const { mode: slug } = useParams<{ mode: string }>();
  const mode = modeFromSlug(slug || "");
  const { session, ready } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);

  if (!mode) return <p className="empty">Unknown section.</p>;
  if (!session) return null;
  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <PublishForm mode={mode} />
    </div>
  );
}
