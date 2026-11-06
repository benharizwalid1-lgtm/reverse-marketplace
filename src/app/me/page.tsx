"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useStore } from "@/lib/store";
import { StatusPill } from "@/components/status-pill";
import { NeedOffer } from "@/components/need-offer";
import { formatDate, trustScore } from "@/lib/format";

export default function MePage() {
  return (
    <Suspense fallback={<p className="empty">Loading your Reverse…</p>}>
      <MeInner />
    </Suspense>
  );
}

function MeInner() {
  const { data, session, ready, updateProfile } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("tab") || "publications";

  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);

  const user = data.users.find((item) => item.id === session?.id);
  if (!user) return null;

  const listings = data.listings.filter((item) => item.userId === user.id);
  const sent = data.proposals.filter((item) => item.fromUserId === user.id);
  const received = data.proposals.filter((item) => listings.some((listing) => listing.id === item.listingId));
  const exchanges = data.exchanges.filter((item) => item.ownerId === user.id || item.partnerId === user.id);
  const completed = exchanges.filter((item) => item.status === "COMPLETED").length;
  const reviews = data.reviews.filter((item) => item.toUserId === user.id);
  const avgRating = reviews.length ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length : null;
  const trust = trustScore({
    verified: user.verified,
    completed,
    avgRating,
    reversePoints: user.reversePoints,
  });

  const tabs = [
    { id: "publications", label: "Publications", count: listings.length },
    { id: "received", label: "Received", count: received.length },
    { id: "sent", label: "Sent", count: sent.length },
    { id: "exchanges", label: "Exchanges", count: exchanges.length },
    { id: "profile", label: "Profile", count: 0 },
  ];

  return (
    <div className="shell section">
      <p className="text-[12px] uppercase tracking-[0.22em] text-[#A98BCB]">My Reverse</p>
      <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="display text-5xl">{user.name}</h1>
          <p className="mt-2 text-[#B9B3C6]">
            {user.location} · Trust {trust} · {user.reversePoints} Reverse points
            {user.verified ? " · Verified" : ""}
          </p>
        </div>
        <Link href="/publish/borrow" className="btn btn-primary">
          New publication
        </Link>
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <Link
            key={item.id}
            href={`/me?tab=${item.id}`}
            className={`rounded-full px-4 py-2 text-sm ${current === item.id ? "bg-[#7953A6]" : "bg-white/5"}`}
          >
            {item.label}
            {item.count ? ` ${item.count}` : ""}
          </Link>
        ))}
      </div>
      {current === "publications" && (
        <div className="mt-8 space-y-6">
          {listings.length === 0 && <p className="empty">You haven’t published yet.</p>}
          {listings.map((listing) => (
            <Link key={listing.id} href={`/listing/${listing.id}`} className="soft-panel hairline block rounded-[1.8rem] p-5">
              <div className="mb-3 flex items-center justify-between">
                <StatusPill status={listing.status} />
                <span className="text-sm text-[#B9B3C6]">{listing.type}</span>
              </div>
              <NeedOffer compact type={listing.type} needTitle={listing.needTitle} offerTitle={listing.offerTitle} durationDays={listing.durationDays} />
            </Link>
          ))}
        </div>
      )}
      {current === "received" && (
        <ProposalList
          items={received.map((item) => ({
            ...item,
            fromName: data.users.find((user) => user.id === item.fromUserId)?.name || "",
            listing: data.listings.find((listing) => listing.id === item.listingId),
          }))}
          empty="No incoming proposals yet."
        />
      )}
      {current === "sent" && (
        <ProposalList
          items={sent.map((item) => ({
            ...item,
            fromName: data.users.find((user) => user.id === item.fromUserId)?.name || "",
            listing: data.listings.find((listing) => listing.id === item.listingId),
          }))}
          empty="You haven’t sent a proposal yet."
        />
      )}
      {current === "exchanges" && (
        <div className="mt-8 space-y-4">
          {exchanges.length === 0 && <p className="empty">No exchanges yet.</p>}
          {exchanges.map((exchange) => (
            <Link key={exchange.id} href={`/exchange/${exchange.id}`} className="soft-panel hairline block rounded-[1.8rem] p-5">
              <div className="flex items-center justify-between">
                <StatusPill status={exchange.status} />
                <span className="text-sm text-[#B9B3C6]">{exchange.type}</span>
              </div>
              <p className="mt-3 display text-2xl">{exchange.needTitle || exchange.offerTitle}</p>
              <p className="mt-1 text-sm text-[#B9B3C6]">
                {data.users.find((item) => item.id === exchange.ownerId)?.name} · {data.users.find((item) => item.id === exchange.partnerId)?.name}
                {exchange.returnDate ? ` · Return ${formatDate(exchange.returnDate)}` : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
      {current === "profile" && (
        <form
          className="mx-auto mt-8 max-w-xl space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            updateProfile({
              name: String(form.get("name") || user.name),
              location: String(form.get("location") || user.location),
              bio: String(form.get("bio") || ""),
              avatar: String(form.get("avatar") || user.avatar || ""),
            });
          }}
        >
          <div>
            <label htmlFor="name">Name</label>
            <input id="name" name="name" defaultValue={user.name} />
          </div>
          <div>
            <label htmlFor="location">Location</label>
            <input id="location" name="location" defaultValue={user.location} />
          </div>
          <div>
            <label htmlFor="bio">Bio</label>
            <textarea id="bio" name="bio" rows={4} defaultValue={user.bio} />
          </div>
          <div>
            <label htmlFor="avatar">Profile picture URL</label>
            <input id="avatar" name="avatar" defaultValue={user.avatar ?? ""} />
          </div>
          <button className="btn btn-primary">Save profile</button>
        </form>
      )}
    </div>
  );
}

function ProposalList({
  items,
  empty,
}: {
  items: { id: string; status: string; message: string; fromName: string; listing?: { type: string; offerTitle: string; needTitle: string } }[];
  empty: string;
}) {
  if (items.length === 0) return <p className="empty">{empty}</p>;
  return (
    <div className="mt-8 space-y-4">
      {items.map((item) => (
        <Link key={item.id} href={`/proposal/${item.id}`} className="soft-panel hairline block rounded-[1.8rem] p-5">
          <div className="flex items-center justify-between">
            <span>{item.fromName}</span>
            <StatusPill status={item.status} />
          </div>
          <p className="mt-2 text-sm text-[#B9B3C6]">
            {item.listing?.type} · {item.listing?.needTitle || item.listing?.offerTitle}
          </p>
          <p className="mt-2">{item.message}</p>
        </Link>
      ))}
    </div>
  );
}
