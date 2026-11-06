"use client";

import { useState } from "react";
import { sendProposal } from "@/lib/actions";
import { borrowDeposit, valueGap } from "@/lib/valuation";
import { formatDt } from "@/lib/format";

type Listing = {
  id: string;
  type: string;
  needTitle: string;
  offerTitle: string;
  durationDays: number | null;
  estimatedValue: number | null;
  userSuggestedValue: number | null;
};

export function ProposalForm({ listing }: { listing: Listing }) {
  const offerValue = listing.userSuggestedValue ?? listing.estimatedValue ?? 0;
  const [needValue, setNeedValue] = useState(offerValue ? Math.round(offerValue * 0.7) : 0);
  const [offer, setOffer] = useState(offerValue);
  const gap = valueGap(needValue, offer);
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    const result = await sendProposal(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <form action={onSubmit} className="soft-panel hairline space-y-4 rounded-[2rem] p-5">
      <p className="display text-2xl">
        {listing.type === "GET" ? "Request this object" : "Propose an exchange"}
      </p>
      <input type="hidden" name="listingId" value={listing.id} />
      {listing.type !== "GET" && (
        <div>
          <label htmlFor="counterOfferTitle">What you can offer</label>
          <input id="counterOfferTitle" name="counterOfferTitle" placeholder="Your object or skill" />
        </div>
      )}
      {listing.type === "BORROW" && (
        <>
          <div>
            <label htmlFor="durationDays">Duration (days)</label>
            <input id="durationDays" name="durationDays" type="number" defaultValue={listing.durationDays ?? 5} />
          </div>
          <div>
            <label htmlFor="depositAmount">Refundable deposit (DT)</label>
            <input
              id="depositAmount"
              name="depositAmount"
              type="number"
              defaultValue={borrowDeposit(listing.estimatedValue)}
            />
          </div>
        </>
      )}
      {(listing.type === "BORROW" || listing.type === "SWAP") && (
        <>
          <div>
            <label htmlFor="proposedNeedValue">Value of what you bring (DT)</label>
            <input
              id="proposedNeedValue"
              name="proposedNeedValue"
              type="number"
              value={needValue}
              onChange={(event) => setNeedValue(Number(event.target.value))}
            />
          </div>
          <div>
            <label htmlFor="proposedOfferValue">Agreed value of their object (DT)</label>
            <input
              id="proposedOfferValue"
              name="proposedOfferValue"
              type="number"
              value={offer}
              onChange={(event) => setOffer(Number(event.target.value))}
            />
          </div>
          <p className="text-sm text-[#B9B3C6]">
            Difference {formatDt(gap.difference)}.{" "}
            {listing.type === "SWAP"
              ? gap.balanced
                ? "No extra payment needed if you both agree."
                : `Suggested additional payment: ${formatDt(gap.difference)}.`
              : "BORROW does not treat this gap as a purchase. Use it for fairness and deposit talks."}
          </p>
        </>
      )}
      <div>
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" rows={4} required placeholder="How and when could this happen?" />
      </div>
      {error && <p className="text-sm text-[#E7A0A0]">{error}</p>}
      <button className="btn btn-teal w-full">{listing.type === "GET" ? "Request" : "Send proposal"}</button>
    </form>
  );
}
