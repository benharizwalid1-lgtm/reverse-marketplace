import Link from "next/link";
import { MODE_META, type Mode } from "@/lib/modes";
import { listListings } from "@/lib/queries";
import { ListingCard } from "./listing-card";

export async function ModePage({
  mode,
  searchParams,
}: {
  mode: Mode;
  searchParams: { q?: string; location?: string };
}) {
  const meta = MODE_META[mode];
  const listings = await listListings({
    type: mode,
    q: searchParams.q,
    location: searchParams.location,
  });

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

      <form className="mt-10 flex flex-col gap-3 md:flex-row">
        <input name="q" placeholder="Search needs and offers" defaultValue={searchParams.q} />
        <input name="location" placeholder="City" defaultValue={searchParams.location} className="md:max-w-xs" />
        <button className="btn btn-ghost">Filter</button>
      </form>

      {listings.length === 0 ? (
        <div className="empty">
          Nothing here yet. Be the first to publish a {meta.label} need.
        </div>
      ) : (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
