"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { NeedOffer } from "@/components/need-offer";
import { ValueMeter } from "@/components/value-meter";
import { StatusPill } from "@/components/status-pill";
import { ProposalForm } from "@/components/proposal-form";
import { parsePhotos, formatDt, initials, trustScore } from "@/lib/format";
import { MODE_META, type Mode } from "@/lib/modes";
import { borrowDeposit } from "@/lib/valuation";
import { useStore } from "@/lib/store";

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, session, removeListing } = useStore();
  const listing = data.listings.find((item) => item.id === id);
  const owner = listing ? data.users.find((item) => item.id === listing.userId) : null;

  if (!listing || !owner) {
    return <p className="empty">This publication is gone.</p>;
  }

  const photos = parsePhotos(listing.photos);
  const mode = listing.type as Mode;
  const meta = MODE_META[mode];
  const proposals = data.proposals.filter((item) => item.listingId === listing.id);
  const completed = data.exchanges.filter(
    (item) => (item.ownerId === owner.id || item.partnerId === owner.id) && item.status === "COMPLETED",
  ).length;
  const reviews = data.reviews.filter((item) => item.toUserId === owner.id);
  const avgRating = reviews.length ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length : null;
  const stats = trustScore({
    verified: owner.verified,
    completed,
    avgRating,
    reversePoints: owner.reversePoints,
  });
  const isOwner = session?.id === listing.userId;
  const myProposal = proposals.find((item) => item.fromUserId === session?.id);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-[12px] uppercase tracking-[0.22em]" style={{ color: meta.accent }}>
        {meta.label}
        {listing.lastChance ? " · Last chance" : ""}
      </p>
      <div className="mt-4">
        <NeedOffer type={listing.type} needTitle={listing.needTitle} offerTitle={listing.offerTitle} durationDays={listing.durationDays} />
      </div>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="overflow-hidden rounded-[2rem]">
            {photos[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photos[0]} alt={listing.offerTitle} className="aspect-[16/10] w-full object-cover" />
            ) : (
              <div className="orb aspect-[16/10]" />
            )}
          </div>
          <div className="mt-8 space-y-6 text-[#B9B3C6]">
            {listing.needDescription && listing.type !== "GET" && (
              <p>
                <span className="text-[#F7F5FA]">Need. </span>
                {listing.needDescription}
              </p>
            )}
            {listing.offerDescription && (
              <p>
                <span className="text-[#F7F5FA]">{listing.type === "GET" ? "Available. " : "Offer. "}</span>
                {listing.offerDescription}
              </p>
            )}
            <div className="flex flex-wrap gap-6 text-sm">
              {listing.condition && <span>Condition {listing.condition}</span>}
              {listing.brand && (
                <span>
                  {listing.brand} {listing.model}
                </span>
              )}
              {listing.ageYears != null && <span>{listing.ageYears} years old</span>}
              {listing.experienceLevel && <span>{listing.experienceLevel}</span>}
              {listing.availability && <span>{listing.availability}</span>}
              {listing.meetingMode && <span>{listing.meetingMode === "ONLINE" ? "Online" : "In person"}</span>}
              <span>{listing.location}</span>
            </div>
          </div>
          {(mode === "BORROW" || mode === "SWAP") && (
            <div className="mt-10">
              <ValueMeter
                mode={mode}
                leftLabel={`Needs · ${listing.needTitle}`}
                rightLabel={`Offers · ${listing.offerTitle}`}
                leftValue={null}
                rightValue={listing.userSuggestedValue ?? listing.estimatedValue}
                userSuggested={listing.userSuggestedValue}
                platformEstimate={listing.estimatedValue}
                deposit={mode === "BORROW" ? borrowDeposit(listing.estimatedValue) : null}
              />
            </div>
          )}
        </div>
        <aside className="space-y-6">
          <Link href={`/u/${owner.id}`} className="soft-panel hairline flex items-center gap-4 rounded-[2rem] p-5">
            {owner.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={owner.avatar} alt="" className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <div className="grid h-14 w-14 place-items-center rounded-full bg-[#7953A6]">{initials(owner.name)}</div>
            )}
            <div>
              <p className="flex items-center gap-2">
                {owner.name}
                {owner.verified && <span className="text-[11px] uppercase tracking-[0.14em] text-[#36C6BB]">Verified</span>}
              </p>
              <p className="text-sm text-[#B9B3C6]">
                Trust {stats} · {completed} completed · {owner.reversePoints} pts
              </p>
            </div>
          </Link>
          {isOwner ? (
            <div className="soft-panel hairline rounded-[2rem] p-5">
              <p className="display text-2xl">Your publication</p>
              <p className="mt-2 text-sm text-[#B9B3C6]">{proposals.length} proposal(s)</p>
              <button
                className="btn btn-ghost mt-4"
                onClick={() => {
                  removeListing(listing.id);
                  router.push("/me");
                }}
              >
                Remove
              </button>
              <div className="mt-6 space-y-3">
                {proposals.map((proposal) => {
                  const from = data.users.find((item) => item.id === proposal.fromUserId);
                  return (
                    <Link key={proposal.id} href={`/proposal/${proposal.id}`} className="flex items-center justify-between text-sm">
                      <span>{from?.name}</span>
                      <StatusPill status={proposal.status} />
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : myProposal ? (
            <Link href={`/proposal/${myProposal.id}`} className="btn btn-primary w-full">
              Open your proposal
            </Link>
          ) : session ? (
            <ProposalForm listing={listing} />
          ) : (
            <Link href="/login" className="btn btn-primary w-full">
              Sign in to propose
            </Link>
          )}
          {listing.estimatedValue != null && (
            <p className="text-sm text-[#B9B3C6]">
              Platform estimate for the offered object: {formatDt(listing.estimatedValue)}. This is not a guaranteed market price.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
