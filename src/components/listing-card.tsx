import Link from "next/link";
import { NeedOffer } from "./need-offer";
import { parsePhotos } from "@/lib/format";
import { MODE_META, type Mode } from "@/lib/modes";

type Listing = {
  id: string;
  type: string;
  needTitle: string;
  offerTitle: string;
  durationDays?: number | null;
  location: string;
  photos: string;
  lastChance?: boolean;
  estimatedValue?: number | null;
  user: { name: string; location: string };
};

export function ListingCard({ listing }: { listing: Listing }) {
  const photo = parsePhotos(listing.photos)[0];
  const meta = MODE_META[listing.type as Mode];

  return (
    <Link href={`/listing/${listing.id}`} className="group block">
      <article className="rounded-[2rem] transition">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-[#1C1823]">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt={listing.offerTitle}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="orb h-full w-full" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121016] via-[#121016]/50 to-transparent" />
          <span
            className="absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em]"
            style={{ background: "rgba(18,16,22,0.72)", color: meta?.accent }}
          >
            {meta?.label}
          </span>
          {listing.lastChance ? (
            <span className="absolute right-4 top-4 rounded-full bg-[#36C6BB] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#102422]">
              Last chance
            </span>
          ) : null}
          <div className="absolute inset-x-4 bottom-4">
            <NeedOffer
              compact
              type={listing.type}
              needTitle={listing.needTitle}
              offerTitle={listing.offerTitle}
              durationDays={listing.durationDays}
            />
          </div>
        </div>
        <p className="mt-3 px-2 text-sm text-[#B9B3C6]">
          {listing.user.name} · {listing.location}
        </p>
      </article>
    </Link>
  );
}
