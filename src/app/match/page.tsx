"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ListingCard } from "@/components/listing-card";
import { useStore } from "@/lib/store";

export default function MatchPage() {
  const { data, session, ready } = useStore();
  const router = useRouter();
  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);
  if (!session) return null;

  const mine = data.listings.filter((item) => item.userId === session.id && item.status === "ACTIVE");
  const others = data.listings.filter((item) => item.userId !== session.id && item.status === "ACTIVE");
  const tokens = (text: string) => text.toLowerCase().split(/[^a-z0-9]+/).filter((part) => part.length > 2);
  const matches = others
    .map((listing) => {
      let score = 0;
      for (const mineListing of mine) {
        if (mineListing.type !== listing.type) continue;
        const need = tokens(`${mineListing.needTitle} ${mineListing.needDescription}`);
        const offer = tokens(`${listing.offerTitle} ${listing.offerDescription}`);
        score += need.filter((word) => offer.includes(word)).length * 3;
        if (mineListing.location === listing.location) score += 2;
      }
      return { listing, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((item) => item.listing);
  const users = Object.fromEntries(data.users.map((item) => [item.id, item]));

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-[12px] uppercase tracking-[0.22em] text-[#A98BCB]">Reverse Match</p>
      <h1 className="display mt-2 text-5xl">What fits you</h1>
      {matches.length === 0 ? (
        <div className="empty">
          Publish something first.{" "}
          <Link href="/publish/borrow" className="text-[#A98BCB]">
            Publish
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((listing) => (
            <ListingCard key={listing.id} listing={{ ...listing, user: users[listing.userId] }} />
          ))}
        </div>
      )}
    </div>
  );
}
