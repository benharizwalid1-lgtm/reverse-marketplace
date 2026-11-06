import { notFound, redirect } from "next/navigation";
import { getExchange } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { cancelExchange, confirmHandover, confirmReturn, leaveReview, sendMessage } from "@/lib/actions";
import { StatusPill } from "@/components/status-pill";
import { NeedOffer } from "@/components/need-offer";
import { ValueMeter } from "@/components/value-meter";
import { formatDate, formatDt } from "@/lib/format";
import type { Mode } from "@/lib/modes";

export default async function ExchangePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const exchange = await getExchange((await params).id);
  if (!exchange) notFound();
  if (exchange.ownerId !== session.id && exchange.partnerId !== session.id) redirect("/me");

  const mode = exchange.type as Mode;
  const myReview = exchange.reviews.find((review) => review.fromUserId === session.id);
  const counterpart = exchange.ownerId === session.id ? exchange.partner : exchange.owner;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <div className="flex items-center justify-between">
        <h1 className="display text-4xl">Exchange</h1>
        <StatusPill status={exchange.status} />
      </div>
      <p className="mt-2 text-[#B9B3C6]">
        {exchange.owner.name} · {exchange.partner.name}
      </p>
      <div className="mt-8">
        <NeedOffer
          type={exchange.type}
          needTitle={exchange.needTitle}
          offerTitle={exchange.offerTitle}
          durationDays={exchange.durationDays}
        />
      </div>

      {mode === "BORROW" && (
        <p className="mt-6 text-sm text-[#B9B3C6]">
          Duration {exchange.durationDays ?? "—"} days · Return {formatDate(exchange.returnDate)} · Deposit{" "}
          {formatDt(exchange.depositAmount)} (refundable, separate from any compensation)
        </p>
      )}
      {mode === "SWAP" && (
        <p className="mt-6 text-sm text-[#B9B3C6]">
          Agreed values {formatDt(exchange.agreedNeedValue)} / {formatDt(exchange.agreedOfferValue)} · Extra payment{" "}
          {formatDt(exchange.additionalPayment)}
        </p>
      )}
      {mode === "GET" && <p className="mt-6 text-sm text-[#36C6BB]">This is a free donation. No payment.</p>}
      {mode === "SKILL" && <p className="mt-6 text-sm">Service exchange agreed between both people.</p>}

      {(mode === "BORROW" || mode === "SWAP") && (
        <div className="mt-8">
          <ValueMeter
            mode={mode}
            leftLabel="Partner side"
            rightLabel="Listing side"
            leftValue={exchange.agreedNeedValue}
            rightValue={exchange.agreedOfferValue}
            deposit={exchange.depositAmount}
          />
        </div>
      )}

      <section className="mt-10 flex flex-wrap gap-3">
        {exchange.status !== "COMPLETED" && exchange.status !== "CANCELLED" && (
          <form action={confirmHandover}>
            <input type="hidden" name="id" value={exchange.id} />
            <button className="btn btn-primary">Confirm handover</button>
          </form>
        )}
        {mode === "BORROW" && exchange.status !== "COMPLETED" && exchange.status !== "CANCELLED" && (
          <form action={confirmReturn}>
            <input type="hidden" name="id" value={exchange.id} />
            <button className="btn btn-teal">Confirm return</button>
          </form>
        )}
        {exchange.status !== "COMPLETED" && exchange.status !== "CANCELLED" && (
          <form action={cancelExchange}>
            <input type="hidden" name="id" value={exchange.id} />
            <button className="btn btn-ghost">Cancel</button>
          </form>
        )}
      </section>
      <p className="mt-3 text-sm text-[#B9B3C6]">
        Handover {exchange.ownerHandover ? "owner ✓" : "owner pending"} · {exchange.partnerHandover ? "partner ✓" : "partner pending"}
        {mode === "BORROW" && (
          <>
            {" "}
            · Return {exchange.ownerReturn ? "owner ✓" : "owner pending"} · {exchange.partnerReturn ? "partner ✓" : "partner pending"}
          </>
        )}
      </p>

      <section className="mt-10 space-y-4">
        <h2 className="display text-2xl">Messages</h2>
        {exchange.messages.map((message) => (
          <div key={message.id} className="rounded-[1.5rem] bg-white/5 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#A98BCB]">{message.fromUser.name}</p>
            <p>{message.body}</p>
          </div>
        ))}
        <form action={sendMessage} className="flex gap-3">
          <input type="hidden" name="exchangeId" value={exchange.id} />
          <input name="body" placeholder="Coordinate the meeting" />
          <button className="btn btn-ghost">Send</button>
        </form>
      </section>

      {exchange.status === "COMPLETED" && !myReview && (
        <form action={leaveReview} className="mt-10 space-y-4">
          <h2 className="display text-2xl">Review {counterpart.name}</h2>
          <input type="hidden" name="exchangeId" value={exchange.id} />
          <select name="rating" defaultValue="5">
            <option value="5">5 · Excellent</option>
            <option value="4">4 · Good</option>
            <option value="3">3 · Fine</option>
            <option value="2">2 · Difficult</option>
            <option value="1">1 · Avoid</option>
          </select>
          <textarea name="comment" rows={3} placeholder="How did it go?" />
          <button className="btn btn-primary">Publish review</button>
        </form>
      )}
    </div>
  );
}
