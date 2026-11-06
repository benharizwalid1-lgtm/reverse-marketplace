"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { StatusPill } from "@/components/status-pill";
import { ValueMeter } from "@/components/value-meter";
import { formatDt, formatDate } from "@/lib/format";
import type { Mode } from "@/lib/modes";

export default function ProposalPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, session, decide, sendMessage } = useStore();
  const proposal = data.proposals.find((item) => item.id === id);
  const listing = proposal ? data.listings.find((item) => item.id === proposal.listingId) : null;
  const fromUser = proposal ? data.users.find((item) => item.id === proposal.fromUserId) : null;
  const owner = listing ? data.users.find((item) => item.id === listing.userId) : null;

  if (!proposal || !listing || !fromUser || !owner) return <p className="empty">Proposal not found.</p>;

  const isOwner = session?.id === listing.userId;
  const messages = data.messages.filter((item) => item.proposalId === proposal.id);
  const exchange = data.exchanges.find((item) => item.proposalId === proposal.id);
  const mode = listing.type as Mode;

  return (
    <div className="form-page">
      <Link href={`/listing/${listing.id}`} className="text-sm text-[#A98BCB]">
        ← {listing.offerTitle}
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <h1 className="display text-4xl">Proposal</h1>
        <StatusPill status={proposal.status} />
      </div>
      <p className="mt-3 text-[#B9B3C6]">
        {fromUser.name} → {owner.name} · {formatDate(proposal.createdAt)}
      </p>
      <p className="mt-6 text-lg">{proposal.message}</p>
      {(mode === "BORROW" || mode === "SWAP") && (
        <div className="mt-8">
          <ValueMeter
            mode={mode}
            leftLabel={proposal.counterOfferTitle || "Their side"}
            rightLabel={listing.offerTitle}
            leftValue={proposal.proposedNeedValue}
            rightValue={proposal.proposedOfferValue}
            deposit={proposal.depositAmount}
          />
          {mode === "SWAP" && proposal.additionalPayment ? (
            <p className="mt-4 text-sm">Agreed extra payment to discuss: {formatDt(proposal.additionalPayment)}</p>
          ) : null}
        </div>
      )}
      <section className="mt-10 space-y-4">
        {messages.map((message) => {
          const author = data.users.find((item) => item.id === message.fromUserId);
          return (
            <div key={message.id} className="rounded-[1.5rem] bg-white/5 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#A98BCB]">{author?.name}</p>
              <p>{message.body}</p>
            </div>
          );
        })}
        <form
          className="flex gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const body = String(new FormData(event.currentTarget).get("body") || "").trim();
            if (body) sendMessage({ body, proposalId: proposal.id });
            event.currentTarget.reset();
          }}
        >
          <input name="body" placeholder="Negotiate values, dates, meeting point" />
          <button className="btn btn-ghost">Send</button>
        </form>
      </section>
      {isOwner && proposal.status === "PENDING" && (
        <div className="mt-8 flex gap-3">
          <button
            className="btn btn-teal"
            onClick={() => {
              const exchangeId = decide(proposal.id, "ACCEPT");
              if (exchangeId) router.push(`/exchange/${exchangeId}`);
            }}
          >
            Accept & confirm
          </button>
          <button className="btn btn-ghost" onClick={() => decide(proposal.id, "REJECT")}>
            Decline
          </button>
        </div>
      )}
      {exchange && (
        <Link href={`/exchange/${exchange.id}`} className="btn btn-primary mt-8">
          Open exchange
        </Link>
      )}
    </div>
  );
}
