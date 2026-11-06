type Props = {
  type: string;
  needTitle?: string;
  offerTitle: string;
  durationDays?: number | null;
  compact?: boolean;
};

export function NeedOffer({ type, needTitle, offerTitle, durationDays, compact }: Props) {
  if (type === "GET") {
    return (
      <div className={compact ? "space-y-1" : "space-y-3"}>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#36C6BB]">Available · free</p>
        <p className={`display ${compact ? "text-xl" : "text-3xl"}`}>{offerTitle}</p>
      </div>
    );
  }

  const needLabel = type === "SKILL" ? "Wants to learn" : "Needs";
  const offerLabel = type === "SKILL" ? "Can teach" : "Offers";

  return (
    <div className={`grid ${compact ? "gap-3" : "gap-5 md:grid-cols-[1fr_auto_1fr] md:items-center"}`}>
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#A98BCB]">{needLabel}</p>
        <p className={`display ${compact ? "text-lg" : "text-3xl"}`}>{needTitle || "—"}</p>
        {type === "BORROW" && durationDays ? (
          <p className="mt-1 text-sm text-[#B9B3C6]">{durationDays} days</p>
        ) : null}
      </div>
      <div className="hidden h-12 w-12 place-items-center rounded-full border border-white/10 text-[#36C6BB] md:grid">
        ⇄
      </div>
      <div className={compact ? "" : "md:text-right"}>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#36C6BB]">{offerLabel}</p>
        <p className={`display ${compact ? "text-lg" : "text-3xl"}`}>{offerTitle}</p>
      </div>
    </div>
  );
}
