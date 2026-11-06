export function formatDt(value?: number | null) {
  if (value == null) return "—";
  return `${Math.round(value)} DT`;
}

export function formatDate(value?: Date | string | null) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function parsePhotos(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function trustScore(input: {
  verified: boolean;
  completed: number;
  avgRating: number | null;
  reversePoints: number;
}) {
  const ratingPart = (input.avgRating ?? 3.5) * 12;
  const completedPart = Math.min(30, input.completed * 6);
  const verifiedPart = input.verified ? 15 : 0;
  const pointsPart = Math.min(15, input.reversePoints / 20);
  return Math.min(99, Math.round(ratingPart + completedPart + verifiedPart + pointsPart));
}

export function statusLabel(status: string) {
  return status.replaceAll("_", " ").toLowerCase();
}
