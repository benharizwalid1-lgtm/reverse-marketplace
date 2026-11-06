"use client";

import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { StatusPill } from "@/components/status-pill";
import { NeedOffer } from "@/components/need-offer";
import { ValueMeter } from "@/components/value-meter";
import { formatDate, formatDt } from "@/lib/format";
import type { Mode } from "@/lib/modes";

export default function ExchangePage() {
  const { id } = useParams<{ id: string }>();
  const { data, session, confirmHandover, confirmReturn, cancelExchange, leaveReview, sendMessage } = useStore();
  const exchange = data.exchanges.find((item) => item.id === id);
  if (!exchange) return <p className="empty">Exchange not found.</p>;
  const owner = data.users.find((item) => item.id === exchange.ownerId);
  const partner = data.users.find((item) => item.id === exchange.partnerId);
  const mode = exchange.type as Mode;
  const messages = data.messages.filter((item) => item.exchangeId === exchange.id);
  const myReview = data.reviews.find((item) => item.exchangeId === exchange.id && item.fromUserId === session?.id);
  const counterpart = session?.id === exchange.ownerId ? partner : owner;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <div className="flex items-center justify-between">
        <h1 className="display text-4xl">Exchange</h1>
        <StatusPill status={exchange.status} />
      </div>
      <p className="mt-2 text-[#B9B3C6]">
        {owner?.name} · {partner?.name}
      </p>
      <div className="mt-8">
        <NeedOffer type={exchange.type} needTitle={exchange.needTitle} offerTitle={exchange.offerTitle} durationDays={exchange.durationDays} />
      </div>
      {mode === "BORROW" && (
        <p className="mt-6 text-sm text-[#B9B3C6]">
          Duration {exchange.durationDays ?? "—"} days · Return {formatDate(exchange.returnDate)} · Deposit {formatDt(exchange.depositAmount)}
        </p>
      )}
      {mode === "SWAP" && (
        <p className="mt-6 text-sm text-[#B9B3C6]">
          Agreed values {formatDt(exchange.agreedNeedValue)} / {formatDt(exchange.agreedOfferValue)} · Extra payment {formatDt(exchange.additionalPayment)}
        </p>
      )}
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
          <button className="btn btn-primary" onClick={() => confirmHandover(exchange.id)}>
            Confirm handover
          </button>
        )}
        {mode === "BORROW" && exchange.status !== "COMPLETED" && exchange.status !== "CANCELLED" && (
          <button className="btn btn-teal" onClick={() => confirmReturn(exchange.id)}>
            Confirm return
          </button>
        )}
        {exchange.status !== "COMPLETED" && exchange.status !== "CANCELLED" && (
          <button className="btn btn-ghost" onClick={() => cancelExchange(exchange.id)}>
            Cancel
          </button>
        )}
      </section>
      <section className="mt-10 space-y-4">
        <h2 className="display text-2xl">Messages</h2>
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
            if (body) sendMessage({ body, exchangeId: exchange.id });
            event.currentTarget.reset();
          }}
        >
          <input name="body" placeholder="Coordinate the meeting" />
          <button className="btn btn-ghost">Send</button>
        </form>
      </section>
      {exchange.status === "COMPLETED" && !myReview && counterpart && (
        <form
          className="mt-10 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            leaveReview({
              exchangeId: exchange.id,
              rating: Number(form.get("rating") || 5),
              comment: String(form.get("comment") || ""),
            });
          }}
        >
          <h2 className="display text-2xl">Review {counterpart.name}</h2>
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
