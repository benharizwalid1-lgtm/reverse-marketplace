import { statusLabel } from "@/lib/format";

const COLORS: Record<string, string> = {
  ACTIVE: "#36C6BB",
  PENDING: "#A98BCB",
  ACCEPTED: "#36C6BB",
  REJECTED: "#C98989",
  CONFIRMED: "#A98BCB",
  HANDOVER_PENDING: "#A98BCB",
  IN_PROGRESS: "#36C6BB",
  RETURN_PENDING: "#A98BCB",
  COMPLETED: "#36C6BB",
  CANCELLED: "#C98989",
  CLOSED: "#B9B3C6",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em]"
      style={{ color: COLORS[status] ?? "#F7F5FA", border: "1px solid currentColor" }}
    >
      {statusLabel(status)}
    </span>
  );
}
