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
      <div>
        <p className="eyebrow" style={{ color: "var(--teal)" }}>
          Available · free
        </p>
        <p className="display" style={{ fontSize: compact ? "1.2rem" : "2rem" }}>
          {offerTitle}
        </p>
      </div>
    );
  }

  const needLabel = type === "SKILL" ? "Wants to learn" : "Needs";
  const offerLabel = type === "SKILL" ? "Can teach" : "Offers";

  return (
    <div className={`need-offer ${compact ? "" : "large"}`}>
      <div>
        <p className="eyebrow" style={{ color: "var(--mauve-light)" }}>
          {needLabel}
        </p>
        <p className="display" style={{ fontSize: compact ? "1.1rem" : "2rem" }}>
          {needTitle || "—"}
        </p>
        {type === "BORROW" && durationDays ? (
          <p style={{ marginTop: "0.3rem", color: "var(--mute)", fontSize: "0.9rem" }}>{durationDays} days</p>
        ) : null}
      </div>
      {!compact && <div className="swap-mark">⇄</div>}
      <div className="offer-side">
        <p className="eyebrow" style={{ color: "var(--teal)" }}>
          {offerLabel}
        </p>
        <p className="display" style={{ fontSize: compact ? "1.1rem" : "2rem" }}>
          {offerTitle}
        </p>
      </div>
    </div>
  );
}
