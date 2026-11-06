import { notFound, redirect } from "next/navigation";
import { getProposalThread } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { decideProposal, sendMessage } from "@/lib/actions";
import { StatusPill } from "@/components/status-pill";
import { ValueMeter } from "@/components/value-meter";
import { formatDt, formatDate } from "@/lib/format";
import type { Mode } from "@/lib/modes";
import Link from "next/link";

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const proposal = await getProposalThread((await params).id);
  if (!proposal) notFound();
  const isOwner = proposal.listing.userId === session.id;
  const isSender = proposal.fromUserId === session.id;
  if (!isOwner && !isSender) redirect("/me");

  const mode = proposal.listing.type as Mode;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link href={`/listing/${proposal.listing.id}`} className="text-sm text-[#A98BCB]">
        ← {proposal.listing.offerTitle}
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <h1 className="display text-4xl">Proposal</h1>
        <StatusPill status={proposal.status} />
      </div>
      <p className="mt-3 text-[#B9B3C6]">
        {proposal.fromUser.name} → {proposal.listing.user.name} · {formatDate(proposal.createdAt)}
      </p>
      <p className="mt-6 text-lg">{proposal.message}</p>
      {proposal.counterOfferTitle && (
        <p className="mt-3 text-sm text-[#B9B3C6]">Counter offer: {proposal.counterOfferTitle}</p>
      )}

      {(mode === "BORROW" || mode === "SWAP") && (
        <div className="mt-8">
          <ValueMeter
            mode={mode}
            leftLabel={proposal.counterOfferTitle || "Their side"}
            rightLabel={proposal.listing.offerTitle}
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
        {proposal.messages.map((message) => (
          <div key={message.id} className="rounded-[1.5rem] bg-white/5 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#A98BCB]">{message.fromUser.name}</p>
            <p>{message.body}</p>
          </div>
        ))}
        <form action={sendMessage} className="flex gap-3">
          <input type="hidden" name="proposalId" value={proposal.id} />
          <input name="body" placeholder="Negotiate values, dates, meeting point" />
          <button className="btn btn-ghost">Send</button>
        </form>
      </section>

      {isOwner && proposal.status === "PENDING" && (
        <div className="mt-8 flex gap-3">
          <form action={decideProposal}>
            <input type="hidden" name="id" value={proposal.id} />
            <input type="hidden" name="decision" value="ACCEPT" />
            <button className="btn btn-teal">Accept & confirm</button>
          </form>
          <form action={decideProposal}>
            <input type="hidden" name="id" value={proposal.id} />
            <input type="hidden" name="decision" value="REJECT" />
            <button className="btn btn-ghost">Decline</button>
          </form>
        </div>
      )}

      {proposal.exchange && (
        <Link href={`/exchange/${proposal.exchange.id}`} className="btn btn-primary mt-8">
          Open exchange
        </Link>
      )}
    </div>
  );
}
