import { listListings } from "@/lib/queries";
import { ListingCard } from "@/components/listing-card";

export default async function LastChancePage() {
  const listings = await listListings({ lastChance: true });
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-[12px] uppercase tracking-[0.22em] text-[#36C6BB]">The last chance</p>
      <h1 className="display mt-2 text-5xl">Before it disappears</h1>
      <p className="mt-3 max-w-xl text-[#B9B3C6]">
        Objects that might otherwise be thrown away. Give them one more life.
      </p>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
