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
    <div className="shell section">
      <p className="kicker" style={{ color: meta.accent }}>
        {meta.verb}
      </p>
      <div className="page-head" style={{ marginTop: "0.8rem" }}>
        <div>
          <h1 className="display" style={{ fontSize: "3rem" }}>
            {meta.label}
          </h1>
          <p className="lede">{meta.description}</p>
        </div>
        <Link href={`/publish/${meta.slug}`} className="btn btn-primary">
          Publish in {meta.label}
        </Link>
      </div>

      <form className="filters" onSubmit={(event) => event.preventDefault()}>
        <input name="q" placeholder="Search needs and offers" value={q} onChange={(event) => setQ(event.target.value)} />
        <input name="location" placeholder="City" value={location} onChange={(event) => setLocation(event.target.value)} style={{ maxWidth: "16rem" }} />
        <button className="btn btn-ghost">Filter</button>
      </form>

      {listings.length === 0 ? (
        <div className="empty">Nothing here yet. Be the first to publish a {meta.label} need.</div>
      ) : (
        <div className="listing-grid">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={{ ...listing, user: users[listing.userId] }} />
          ))}
        </div>
      )}
    </div>
  );
}
