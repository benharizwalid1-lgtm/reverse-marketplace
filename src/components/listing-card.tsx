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
  user?: { name: string; location: string };
};

export function ListingCard({ listing }: { listing: Listing }) {
  const photo = parsePhotos(listing.photos)[0];
  const meta = MODE_META[listing.type as Mode];

  return (
    <Link href={`/listing/${listing.id}`} className="listing-card">
      <article>
        <div className="listing-media">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={listing.offerTitle} />
          ) : (
            <div className="orb" style={{ width: "100%", height: "100%" }} />
          )}
          <div className="shade" />
          <span className="badge" style={{ color: meta?.accent }}>
            {meta?.label}
          </span>
          {listing.lastChance ? <span className="badge right">Last chance</span> : null}
          <div className="listing-copy">
            <NeedOffer
              compact
              type={listing.type}
              needTitle={listing.needTitle}
              offerTitle={listing.offerTitle}
              durationDays={listing.durationDays}
            />
          </div>
        </div>
        <p className="listing-meta">
          {listing.user?.name ?? "Someone"} · {listing.location}
        </p>
      </article>
    </Link>
  );
}
