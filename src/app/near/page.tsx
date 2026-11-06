import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { listListings } from "@/lib/queries";
import { ListingCard } from "@/components/listing-card";

export default async function NearPage() {
  const session = await getSession();
  const user = session
    ? await prisma.user.findUnique({ where: { id: session.id } })
    : null;
  const location = user?.location || "Tunis";
  const listings = await listListings({ near: location });

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-[12px] uppercase tracking-[0.22em] text-[#36C6BB]">Near me</p>
      <h1 className="display mt-2 text-5xl">{location}</h1>
      <p className="mt-3 max-w-xl text-[#B9B3C6]">
        Approximate city match only. REVERSE never asks for a precise street address.
      </p>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
