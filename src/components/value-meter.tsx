import { balanceCopy } from "@/lib/valuation";
import { formatDt } from "@/lib/format";
import type { Mode } from "@/lib/modes";

type Props = {
  mode: Mode;
  leftLabel: string;
  rightLabel: string;
  leftValue?: number | null;
  rightValue?: number | null;
  userSuggested?: number | null;
  platformEstimate?: number | null;
  deposit?: number | null;
};

export function ValueMeter({
  mode,
  leftLabel,
  rightLabel,
  leftValue,
  rightValue,
  userSuggested,
  platformEstimate,
  deposit,
}: Props) {
  const hasLeft = leftValue != null;
  const a = leftValue ?? 0;
  const b = rightValue ?? 0;
  const max = Math.max(a, b, 1);
  const difference = Math.abs(a - b);
  const balanced = !hasLeft ? false : max === 0 ? true : difference / max <= 0.1 || difference < 50;

  return (
    <section className="soft-panel hairline rounded-[2rem] p-6">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#A98BCB]">Value balance</p>
      <p className="mt-2 max-w-xl text-sm text-[#B9B3C6]">
        Platform estimates are approximate. They are not a guaranteed market price. Both people must agree.
      </p>
      <div className="mt-6 space-y-4">
        {hasLeft ? (
          <Bar label={leftLabel} value={a} max={max} color="#A98BCB" />
        ) : (
          <p className="text-sm text-[#B9B3C6]">
            The needed object is priced when someone sends a proposal. Until then, only the offered object has an estimate.
          </p>
        )}
        <Bar label={rightLabel} value={b} max={max} color="#36C6BB" />
      </div>
      <div className="mt-6 flex flex-wrap gap-6 text-sm">
        {hasLeft && <Stat k="Difference" v={formatDt(difference)} />}
        {hasLeft && <Stat k="Status" v={balanced ? "Balanced" : "Needs agreement"} />}
        {platformEstimate != null && <Stat k="Platform estimate" v={formatDt(platformEstimate)} />}
        {userSuggested != null && <Stat k="User suggested" v={formatDt(userSuggested)} />}
        {mode === "BORROW" && deposit != null && <Stat k="Suggested deposit" v={formatDt(deposit)} />}
      </div>
      <p className="mt-5 text-sm text-[#F7F5FA]">
        {hasLeft
          ? balanceCopy(mode, Math.round(difference), balanced)
          : "Estimates help both people talk about fairness. They are never a guaranteed market price."}
      </p>
    </section>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span>{label}</span>
        <span>{formatDt(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.16em] text-[#B9B3C6]">{k}</p>
      <p className="display text-xl">{v}</p>
    </div>
  );
}
