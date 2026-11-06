"use client";

import { ListingCard } from "@/components/listing-card";
import { useStore } from "@/lib/store";

export default function LastChancePage() {
  const { data } = useStore();
  const listings = data.listings.filter((item) => item.status === "ACTIVE" && item.lastChance);
  const users = Object.fromEntries(data.users.map((item) => [item.id, item]));
  return (
    <div className="shell section">
      <p className="text-[12px] uppercase tracking-[0.22em] text-[#36C6BB]">The last chance</p>
      <h1 className="display mt-2 text-5xl">Before it disappears</h1>
      <div className="listing-grid">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={{ ...listing, user: users[listing.userId] }} />
        ))}
      </div>
    </div>
  );
}
