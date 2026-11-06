import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { matchListings } from "@/lib/queries";
import { ListingCard } from "@/components/listing-card";
import Link from "next/link";

export default async function MatchPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const matches = await matchListings(session.id);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-[12px] uppercase tracking-[0.22em] text-[#A98BCB]">Reverse Match</p>
      <h1 className="display mt-2 text-5xl">What fits you</h1>
      <p className="mt-3 max-w-xl text-[#B9B3C6]">
        Suggestions based on the needs and offers in your own publications.
      </p>
      {matches.length === 0 ? (
        <div className="empty">
          Publish something first so Match has a signal to work with.{" "}
          <Link href="/publish/borrow" className="text-[#A98BCB]">
            Publish
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
