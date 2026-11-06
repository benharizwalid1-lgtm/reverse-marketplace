export const MODES = ["BORROW", "GET", "SWAP", "SKILL"] as const;
export type Mode = (typeof MODES)[number];

export const MODE_META: Record<
  Mode,
  {
    slug: string;
    label: string;
    verb: string;
    tagline: string;
    description: string;
    accent: string;
    glow: string;
  }
> = {
  BORROW: {
    slug: "borrow",
    label: "Borrow",
    verb: "Lend & borrow",
    tagline: "Use it. Return it.",
    description:
      "Temporary reciprocal exchange. You need something for a while, and you offer something in return.",
    accent: "#A98BCB",
    glow: "rgba(121, 83, 166, 0.45)",
  },
  GET: {
    slug: "get",
    label: "Get",
    verb: "Give freely",
    tagline: "It's free. Always.",
    description:
      "Receive objects people no longer need. No payment. No exchange required.",
    accent: "#36C6BB",
    glow: "rgba(54, 198, 187, 0.35)",
  },
  SWAP: {
    slug: "swap",
    label: "Swap",
    verb: "Trade forever",
    tagline: "Yours for mine.",
    description:
      "Permanent exchange of objects. Ownership changes hands. Values can be balanced.",
    accent: "#7953A6",
    glow: "rgba(169, 139, 203, 0.4)",
  },
  SKILL: {
    slug: "skill",
    label: "Skill",
    verb: "Share know-how",
    tagline: "Time for time.",
    description:
      "Exchange services and knowledge. Teach what you know. Learn what you need.",
    accent: "#7ED9D2",
    glow: "rgba(54, 198, 187, 0.28)",
  },
};

export function isMode(value: string): value is Mode {
  return (MODES as readonly string[]).includes(value);
}

export function modeFromSlug(slug: string): Mode | null {
  const found = MODES.find((mode) => MODE_META[mode].slug === slug.toLowerCase());
  return found ?? null;
}

export const CONDITIONS = ["New", "Like new", "Good", "Fair", "Worn"] as const;
export const CATEGORIES = [
  "Electronics",
  "Cameras",
  "Computers",
  "Phones",
  "Furniture",
  "Home",
  "Sports",
  "Music",
  "Books",
  "Fashion",
  "Tools",
  "Kids",
  "Other",
] as const;

export const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Professional"] as const;

export const TUNISIAN_CITIES = [
  "Tunis",
  "Ariana",
  "La Marsa",
  "Carthage",
  "Sousse",
  "Sfax",
  "Monastir",
  "Bizerte",
  "Nabeul",
  "Hammamet",
] as const;
