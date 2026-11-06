"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { hashPassword, requireUser, verifyPassword } from "./auth";
import { createSession, destroySession } from "./session";
import { isMode, type Mode } from "./modes";
import { borrowDeposit, estimateObjectValue, valueGap } from "./valuation";
import {
  addPoints,
  createId,
  createUser,
  db,
  findUserByEmail,
  type Exchange,
  type Listing,
  type Message,
  type Proposal,
  type Review,
  updateUser,
} from "./db";

const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).optional(),
  location: z.string().min(2).optional(),
});

export async function signupAction(formData: FormData) {
  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    location: formData.get("location"),
  });
  if (!parsed.success || !parsed.data.name || !parsed.data.location) {
    return { error: "Please fill in a valid name, email, location, and password." };
  }
  const existing = findUserByEmail(parsed.data.email);
  if (existing) return { error: "An account with this email already exists." };

  const user = createUser({
    id: createId("user"),
    email: parsed.data.email.toLowerCase(),
    passwordHash: await hashPassword(parsed.data.password),
    name: parsed.data.name,
    location: parsed.data.location,
  });
  await createSession({ id: user.id, email: user.email, name: user.name });
  redirect("/me");
}

export async function loginAction(formData: FormData) {
  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter a valid email and password." };
  const user = findUserByEmail(parsed.data.email);
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "Those credentials don't match a REVERSE account." };
  }
  await createSession({ id: user.id, email: user.email, name: user.name });
  redirect("/me");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

function num(value: FormDataEntryValue | null) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function publishListing(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");

  const type = String(formData.get("type") || "");
  if (!isMode(type)) return { error: "Unknown publication type." };

  const needTitle = String(formData.get("needTitle") || "").trim();
  const offerTitle = String(formData.get("offerTitle") || "").trim();
  const location = String(formData.get("location") || "").trim();
  if (!offerTitle || !location) return { error: "Offer and location are required." };
  if (type !== "GET" && !needTitle) return { error: "Tell us what you need." };

  const photos = String(formData.get("photos") || "[]");
  const estimateInput = {
    category: String(formData.get("category") || ""),
    brand: String(formData.get("brand") || ""),
    model: String(formData.get("model") || ""),
    ageYears: num(formData.get("ageYears")),
    condition: String(formData.get("condition") || ""),
    originalPrice: num(formData.get("originalPrice")),
    userSuggestedValue: num(formData.get("userSuggestedValue")),
  };
  const estimate =
    type === "BORROW" || type === "SWAP" ? estimateObjectValue(estimateInput) : null;

  const listing: Listing = {
    id: createId("list"),
    type,
    userId: user.id,
    needTitle,
    offerTitle,
    needDescription: String(formData.get("needDescription") || ""),
    offerDescription: String(formData.get("offerDescription") || ""),
    photos,
    condition: estimateInput.condition,
    category: estimateInput.category,
    brand: estimateInput.brand,
    model: estimateInput.model,
    ageYears: estimateInput.ageYears,
    originalPrice: estimateInput.originalPrice,
    userSuggestedValue: estimateInput.userSuggestedValue,
    estimatedValue: estimate?.estimatedValue ?? null,
    durationDays: num(formData.get("durationDays")),
    location,
    lastChance: formData.get("lastChance") === "on",
    experienceLevel: String(formData.get("experienceLevel") || ""),
    availability: String(formData.get("availability") || ""),
    meetingMode: String(formData.get("meetingMode") || ""),
    status: "ACTIVE",
    createdAt: new Date(),
  };
  db().listings.unshift(listing);

  revalidatePath(`/${type.toLowerCase()}`);
  redirect(`/listing/${listing.id}`);
}

export async function updateListing(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") || "");
  const listing = db().listings.find((item) => item.id === id);
  if (!listing || listing.userId !== user.id) return;
  listing.needTitle = String(formData.get("needTitle") || listing.needTitle);
  listing.offerTitle = String(formData.get("offerTitle") || listing.offerTitle);
  listing.needDescription = String(formData.get("needDescription") || "");
  listing.offerDescription = String(formData.get("offerDescription") || "");
  listing.condition = String(formData.get("condition") || listing.condition);
  listing.location = String(formData.get("location") || listing.location);
  listing.status = String(formData.get("status") || listing.status);
  revalidatePath(`/listing/${id}`);
  revalidatePath("/me");
}

export async function deleteListing(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") || "");
  const listing = db().listings.find((item) => item.id === id);
  if (!listing || listing.userId !== user.id) return;
  db().listings.splice(db().listings.indexOf(listing), 1);
  revalidatePath("/me");
  redirect("/me");
}

export async function sendProposal(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const listingId = String(formData.get("listingId") || "");
  const listing = db().listings.find((item) => item.id === listingId);
  if (!listing || listing.status !== "ACTIVE") return { error: "This publication is no longer open." };
  if (listing.userId === user.id) return { error: "You can't propose on your own listing." };

  const proposedNeedValue = num(formData.get("proposedNeedValue"));
  const proposedOfferValue = num(formData.get("proposedOfferValue")) ?? listing.userSuggestedValue ?? listing.estimatedValue;
  const gap = valueGap(proposedNeedValue, proposedOfferValue);
  const additionalPayment =
    listing.type === "SWAP" && !gap.balanced ? gap.difference : num(formData.get("additionalPayment")) ?? 0;
  const depositAmount =
    listing.type === "BORROW"
      ? num(formData.get("depositAmount")) ?? borrowDeposit(listing.estimatedValue)
      : 0;

  const proposal: Proposal = {
    id: createId("prop"),
    listingId,
    fromUserId: user.id,
    message: String(formData.get("message") || "").trim() || "I'd like to make this exchange.",
    counterOfferTitle: String(formData.get("counterOfferTitle") || ""),
    proposedNeedValue,
    proposedOfferValue,
    additionalPayment,
    depositAmount,
    durationDays: num(formData.get("durationDays")) ?? listing.durationDays,
    status: "PENDING",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db().proposals.unshift(proposal);

  revalidatePath(`/listing/${listingId}`);
  redirect(`/proposal/${proposal.id}`);
}

export async function decideProposal(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") || "");
  const decision = String(formData.get("decision") || "");
  const proposal = db().proposals.find((item) => item.id === id);
  if (!proposal) return;
  const listing = db().listings.find((item) => item.id === proposal.listingId);
  if (!listing || listing.userId !== user.id) return;
  if (proposal.status !== "PENDING") return;

  if (decision === "REJECT") {
    proposal.status = "REJECTED";
    proposal.updatedAt = new Date();
    revalidatePath("/me");
    revalidatePath(`/proposal/${id}`);
    return;
  }

  if (decision !== "ACCEPT") return;

  const returnDate =
    listing.type === "BORROW" && proposal.durationDays
      ? new Date(Date.now() + proposal.durationDays * 24 * 60 * 60 * 1000)
      : null;

  proposal.status = "ACCEPTED";
  proposal.updatedAt = new Date();
  if (listing.type === "GET") listing.status = "CLOSED";

  const exchange: Exchange = {
    id: createId("ex"),
    listingId: listing.id,
    proposalId: proposal.id,
    type: listing.type,
    ownerId: listing.userId,
    partnerId: proposal.fromUserId,
    status: "CONFIRMED",
    needTitle: listing.needTitle,
    offerTitle: listing.offerTitle,
    agreedNeedValue: proposal.proposedNeedValue,
    agreedOfferValue: proposal.proposedOfferValue,
    additionalPayment: proposal.additionalPayment,
    depositAmount: proposal.depositAmount,
    durationDays: proposal.durationDays,
    startDate: new Date(),
    returnDate,
    ownerHandover: false,
    partnerHandover: false,
    ownerReturn: false,
    partnerReturn: false,
    createdAt: new Date(),
  };
  db().exchanges.unshift(exchange);
  addPoints(listing.userId, listing.type === "GET" ? 25 : 15);
  addPoints(proposal.fromUserId, 10);

  revalidatePath("/me");
  redirect(`/exchange/${exchange.id}`);
}

export async function sendMessage(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const body = String(formData.get("body") || "").trim();
  if (!body) return;
  const proposalId = String(formData.get("proposalId") || "") || null;
  const exchangeId = String(formData.get("exchangeId") || "") || null;
  const message: Message = {
    id: createId("msg"),
    fromUserId: user.id,
    body,
    proposalId,
    exchangeId,
    createdAt: new Date(),
  };
  db().messages.push(message);
  if (proposalId) revalidatePath(`/proposal/${proposalId}`);
  if (exchangeId) revalidatePath(`/exchange/${exchangeId}`);
}

export async function confirmHandover(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") || "");
  const exchange = db().exchanges.find((item) => item.id === id);
  if (!exchange) return;
  if (exchange.ownerId === user.id) exchange.ownerHandover = true;
  else if (exchange.partnerId === user.id) exchange.partnerHandover = true;
  else return;
  exchange.status =
    exchange.ownerHandover && exchange.partnerHandover
      ? exchange.type === "BORROW"
        ? "IN_PROGRESS"
        : "COMPLETED"
      : "HANDOVER_PENDING";
  if (exchange.status === "COMPLETED") addPoints(exchange.ownerId, 20);
  revalidatePath(`/exchange/${id}`);
}

export async function confirmReturn(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") || "");
  const exchange = db().exchanges.find((item) => item.id === id);
  if (!exchange || exchange.type !== "BORROW") return;
  if (exchange.ownerId === user.id) exchange.ownerReturn = true;
  else if (exchange.partnerId === user.id) exchange.partnerReturn = true;
  else return;
  exchange.status = exchange.ownerReturn && exchange.partnerReturn ? "COMPLETED" : "RETURN_PENDING";
  revalidatePath(`/exchange/${id}`);
}

export async function cancelExchange(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") || "");
  const exchange = db().exchanges.find((item) => item.id === id);
  if (!exchange) return;
  if (exchange.ownerId !== user.id && exchange.partnerId !== user.id) return;
  exchange.status = "CANCELLED";
  revalidatePath(`/exchange/${id}`);
  revalidatePath("/me");
}

export async function leaveReview(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const exchangeId = String(formData.get("exchangeId") || "");
  const rating = num(formData.get("rating"));
  const comment = String(formData.get("comment") || "").trim();
  const exchange = db().exchanges.find((item) => item.id === exchangeId);
  if (!exchange || exchange.status !== "COMPLETED") return;
  const toUserId = exchange.ownerId === user.id ? exchange.partnerId : exchange.ownerId;
  if (exchange.ownerId !== user.id && exchange.partnerId !== user.id) return;
  if (!rating || rating < 1 || rating > 5) return;
  const review: Review = {
    id: createId("rev"),
    exchangeId,
    fromUserId: user.id,
    toUserId,
    rating,
    comment,
    createdAt: new Date(),
  };
  db().reviews.push(review);
  revalidatePath(`/exchange/${exchangeId}`);
  revalidatePath(`/u/${toUserId}`);
}

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  updateUser(user.id, {
    name: String(formData.get("name") || user.name),
    location: String(formData.get("location") || user.location),
    bio: String(formData.get("bio") || ""),
    avatar: String(formData.get("avatar") || user.avatar || ""),
  });
  revalidatePath("/me");
}

export async function estimateAction(input: {
  category?: string;
  brand?: string;
  model?: string;
  ageYears?: number | null;
  condition?: string;
  originalPrice?: number | null;
  userSuggestedValue?: number | null;
  mode?: Mode;
}) {
  const estimate = estimateObjectValue(input);
  const deposit = input.mode === "BORROW" ? borrowDeposit(estimate.estimatedValue) : 0;
  return { ...estimate, deposit };
}
