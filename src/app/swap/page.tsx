import { ModePage } from "@/components/mode-page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; location?: string }>;
}) {
  return <ModePage mode="SWAP" searchParams={await searchParams} />;
}
