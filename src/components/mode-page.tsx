"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MODE_META, type Mode } from "@/lib/modes";
import { ListingCard } from "./listing-card";
import { useStore } from "@/lib/store";

export function ModePage({ mode }: { mode: Mode }) {
  const meta = MODE_META[mode];
  const { data } = useStore();
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const users = Object.fromEntries(data.users.map((user) => [user.id, user]));

  const listings = useMemo(
    () =>
      data.listings.filter((listing) => {
        if (listing.status !== "ACTIVE" || listing.type !== mode) return false;
        if (location && listing.location.toLowerCase() !== location.toLowerCase()) return false;
        if (
          q &&
          ![listing.needTitle, listing.offerTitle, listing.needDescription, listing.offerDescription]
            .join(" ")
            .toLowerCase()
            .includes(q.toLowerCase())
        ) {
          return false;
        }
        return true;
      }),
    [data.listings, location, mode, q],
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-[12px] uppercase tracking-[0.22em]" style={{ color: meta.accent }}>
        {meta.verb}
      </p>
      <div className="mt-3 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="display text-5xl">{meta.label}</h1>
          <p className="mt-3 max-w-xl text-[#B9B3C6]">{meta.description}</p>
        </div>
        <Link href={`/publish/${meta.slug}`} className="btn btn-primary">
          Publish in {meta.label}
        </Link>
      </div>

      <form
        className="mt-10 flex flex-col gap-3 md:flex-row"
        onSubmit={(event) => event.preventDefault()}
      >
        <input name="q" placeholder="Search needs and offers" value={q} onChange={(event) => setQ(event.target.value)} />
        <input name="location" placeholder="City" value={location} onChange={(event) => setLocation(event.target.value)} className="md:max-w-xs" />
        <button className="btn btn-ghost">Filter</button>
      </form>

      {listings.length === 0 ? (
        <div className="empty">Nothing here yet. Be the first to publish a {meta.label} need.</div>
      ) : (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={{ ...listing, user: users[listing.userId] }} />
          ))}
        </div>
      )}
    </div>
  );
}
