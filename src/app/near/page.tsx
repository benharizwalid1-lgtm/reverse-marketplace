"use client";

import { ListingCard } from "@/components/listing-card";
import { useStore } from "@/lib/store";

export default function NearPage() {
  const { data, session } = useStore();
  const user = data.users.find((item) => item.id === session?.id);
  const location = user?.location || "Tunis";
  const listings = data.listings.filter((item) => item.status === "ACTIVE" && item.location === location);
  const users = Object.fromEntries(data.users.map((item) => [item.id, item]));

  return (
    <div className="shell section">
      <p className="text-[12px] uppercase tracking-[0.22em] text-[#36C6BB]">Near me</p>
      <h1 className="display mt-2 text-5xl">{location}</h1>
      <p className="mt-3 max-w-xl text-[#B9B3C6]">Approximate city match only.</p>
      <div className="listing-grid">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={{ ...listing, user: users[listing.userId] }} />
        ))}
      </div>
    </div>
  );
}
