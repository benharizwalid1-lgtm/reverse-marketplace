import type { Mode } from "./modes";

export type EstimateInput = {
  category?: string;
  brand?: string;
  model?: string;
  ageYears?: number | null;
  condition?: string;
  originalPrice?: number | null;
  userSuggestedValue?: number | null;
};

export type EstimateResult = {
  estimatedValue: number;
  confidence: "low" | "medium" | "high";
  notes: string[];
  isPlatformEstimate: true;
};

const CATEGORY_BASE: Record<string, number> = {
  Electronics: 700,
  Cameras: 1200,
  Computers: 1600,
  Phones: 1400,
  Furniture: 450,
  Home: 220,
  Sports: 280,
  Music: 600,
  Books: 40,
  Fashion: 180,
  Tools: 250,
  Kids: 120,
  Other: 200,
};

const CATEGORY_DEPRECIATION: Record<string, number> = {
  Electronics: 0.16,
  Cameras: 0.12,
  Computers: 0.18,
  Phones: 0.2,
  Furniture: 0.08,
  Home: 0.1,
  Sports: 0.11,
  Music: 0.09,
  Books: 0.15,
  Fashion: 0.18,
  Tools: 0.07,
  Kids: 0.14,
  Other: 0.12,
};

const CONDITION_FACTOR: Record<string, number> = {
  New: 1,
  "Like new": 0.9,
  Good: 0.75,
  Fair: 0.55,
  Worn: 0.32,
};

const BRAND_FACTOR: Record<string, number> = {
  apple: 1.35,
  sony: 1.2,
  canon: 1.22,
  nikon: 1.18,
  samsung: 1.12,
  fujifilm: 1.15,
  bose: 1.1,
  ikea: 0.85,
  generic: 0.7,
};

function roundDt(value: number) {
  return Math.max(5, Math.round(value / 5) * 5);
}

export function estimateObjectValue(input: EstimateInput): EstimateResult {
  const notes: string[] = [];
  const category = input.category || "Other";
  const base = CATEGORY_BASE[category] ?? CATEGORY_BASE.Other;
  const dep = CATEGORY_DEPRECIATION[category] ?? 0.12;
  const age = Math.max(0, input.ageYears ?? 2);
  const condition = input.condition || "Good";
  const conditionFactor = CONDITION_FACTOR[condition] ?? 0.75;
  const brandKey = (input.brand || "").trim().toLowerCase();
  const brandFactor = brandKey ? (BRAND_FACTOR[brandKey] ?? 1) : 1;

  let value: number;
  let confidence: EstimateResult["confidence"] = "medium";

  if (input.originalPrice && input.originalPrice > 0) {
    value = input.originalPrice * Math.pow(1 - dep, age) * conditionFactor;
    notes.push("Based on original price, age, and condition.");
    confidence = "high";
  } else {
    value = base * Math.pow(1 - dep, age) * conditionFactor * brandFactor;
    notes.push("Based on category averages, not a live market quote.");
    confidence = input.brand ? "medium" : "low";
  }

  if (input.model) notes.push("Model noted, but not independently verified.");
  if (brandKey && BRAND_FACTOR[brandKey]) notes.push("Brand factor applied.");
  notes.push("This is an approximate platform estimate, not a guaranteed market price.");

  const estimatedValue = roundDt(value);
  return { estimatedValue, confidence, notes, isPlatformEstimate: true };
}

export function valueGap(a?: number | null, b?: number | null) {
  const left = a ?? 0;
  const right = b ?? 0;
  const difference = Math.abs(left - right);
  const higher = Math.max(left, right);
  const balanced = higher === 0 ? true : difference / higher <= 0.1 || difference < 50;
  const payer = left === right ? "none" : left > right ? "offerSide" : "needSide";
  return { difference: roundDt(difference), balanced, payer, higher: roundDt(higher) };
}

export function borrowDeposit(estimatedValue?: number | null) {
  if (!estimatedValue) return 0;
  return roundDt(estimatedValue * 0.25);
}

export function balanceCopy(mode: Mode, difference: number, balanced: boolean) {
  if (mode === "GET") return "GET listings are always free. No value balancing.";
  if (mode === "SKILL") return "Skills are exchanged as time and attention, not as object prices.";
  if (balanced) return "Values look close enough. No extra payment is required.";
  if (mode === "BORROW") {
    return `Temporary use. The ${difference} DT gap can inform a refundable deposit or optional compensation — never an automatic purchase.`;
  }
  return `Permanent swap. The person receiving the more valuable object pays ${difference} DT to balance the exchange, if both agree.`;
}
