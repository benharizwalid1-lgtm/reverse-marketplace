"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "./prisma";
import { hashPassword, requireUser, verifyPassword } from "./auth";
import { createSession, destroySession } from "./session";
import { isMode, type Mode } from "./modes";
import { borrowDeposit, estimateObjectValue, valueGap } from "./valuation";

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
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (existing) return { error: "An account with this email already exists." };

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email.toLowerCase(),
      passwordHash: await hashPassword(parsed.data.password),
      name: parsed.data.name,
      location: parsed.data.location,
    },
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
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
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

  const listing = await prisma.listing.create({
    data: {
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
    },
  });

  revalidatePath(`/${type.toLowerCase()}`);
  redirect(`/listing/${listing.id}`);
}

export async function updateListing(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") || "");
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing || listing.userId !== user.id) return;

  await prisma.listing.update({
    where: { id },
    data: {
      needTitle: String(formData.get("needTitle") || listing.needTitle),
      offerTitle: String(formData.get("offerTitle") || listing.offerTitle),
      needDescription: String(formData.get("needDescription") || ""),
      offerDescription: String(formData.get("offerDescription") || ""),
      condition: String(formData.get("condition") || listing.condition),
      location: String(formData.get("location") || listing.location),
      status: String(formData.get("status") || listing.status),
    },
  });
  revalidatePath(`/listing/${id}`);
  revalidatePath("/me");
}

export async function deleteListing(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") || "");
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing || listing.userId !== user.id) return;
  await prisma.listing.delete({ where: { id } });
  revalidatePath("/me");
  redirect("/me");
}

export async function sendProposal(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const listingId = String(formData.get("listingId") || "");
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
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

  const proposal = await prisma.proposal.create({
    data: {
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
    },
  });

  revalidatePath(`/listing/${listingId}`);
  redirect(`/proposal/${proposal.id}`);
}

export async function decideProposal(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") || "");
  const decision = String(formData.get("decision") || "");
  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: { listing: true },
  });
  if (!proposal || proposal.listing.userId !== user.id) return;
  if (proposal.status !== "PENDING") return;

  if (decision === "REJECT") {
    await prisma.proposal.update({ where: { id }, data: { status: "REJECTED" } });
    revalidatePath("/me");
    revalidatePath(`/proposal/${id}`);
    return;
  }

  if (decision !== "ACCEPT") return;

  const listing = proposal.listing;
  const returnDate =
    listing.type === "BORROW" && proposal.durationDays
      ? new Date(Date.now() + proposal.durationDays * 24 * 60 * 60 * 1000)
      : null;

  await prisma.$transaction([
    prisma.proposal.update({ where: { id }, data: { status: "ACCEPTED" } }),
    prisma.listing.update({
      where: { id: listing.id },
      data: { status: listing.type === "GET" ? "CLOSED" : "ACTIVE" },
    }),
    prisma.exchange.create({
      data: {
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
        returnDate,
      },
    }),
    prisma.user.update({
      where: { id: listing.userId },
      data: { reversePoints: { increment: listing.type === "GET" ? 25 : 15 } },
    }),
    prisma.user.update({
      where: { id: proposal.fromUserId },
      data: { reversePoints: { increment: 10 } },
    }),
  ]);

  const exchange = await prisma.exchange.findUnique({ where: { proposalId: proposal.id } });
  revalidatePath("/me");
  redirect(`/exchange/${exchange!.id}`);
}

export async function sendMessage(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const body = String(formData.get("body") || "").trim();
  if (!body) return;
  const proposalId = String(formData.get("proposalId") || "") || null;
  const exchangeId = String(formData.get("exchangeId") || "") || null;
  await prisma.message.create({
    data: { fromUserId: user.id, body, proposalId, exchangeId },
  });
  if (proposalId) revalidatePath(`/proposal/${proposalId}`);
  if (exchangeId) revalidatePath(`/exchange/${exchangeId}`);
}

export async function confirmHandover(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") || "");
  const exchange = await prisma.exchange.findUnique({ where: { id } });
  if (!exchange) return;
  const data =
    exchange.ownerId === user.id
      ? { ownerHandover: true }
      : exchange.partnerId === user.id
        ? { partnerHandover: true }
        : null;
  if (!data) return;
  const ownerHandover = data.ownerHandover ?? exchange.ownerHandover;
  const partnerHandover = data.partnerHandover ?? exchange.partnerHandover;
  const nextStatus =
    ownerHandover && partnerHandover
      ? exchange.type === "BORROW"
        ? "IN_PROGRESS"
        : "COMPLETED"
      : "HANDOVER_PENDING";
  await prisma.exchange.update({
    where: { id },
    data: { ...data, status: nextStatus },
  });
  if (nextStatus === "COMPLETED") {
    await prisma.user.update({
      where: { id: exchange.ownerId },
      data: { reversePoints: { increment: 20 } },
    });
  }
  revalidatePath(`/exchange/${id}`);
}

export async function confirmReturn(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") || "");
  const exchange = await prisma.exchange.findUnique({ where: { id } });
  if (!exchange || exchange.type !== "BORROW") return;
  const data =
    exchange.ownerId === user.id
      ? { ownerReturn: true }
      : exchange.partnerId === user.id
        ? { partnerReturn: true }
        : null;
  if (!data) return;
  const ownerReturn = data.ownerReturn ?? exchange.ownerReturn;
  const partnerReturn = data.partnerReturn ?? exchange.partnerReturn;
  await prisma.exchange.update({
    where: { id },
    data: {
      ...data,
      status: ownerReturn && partnerReturn ? "COMPLETED" : "RETURN_PENDING",
    },
  });
  revalidatePath(`/exchange/${id}`);
}

export async function cancelExchange(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") || "");
  const exchange = await prisma.exchange.findUnique({ where: { id } });
  if (!exchange) return;
  if (exchange.ownerId !== user.id && exchange.partnerId !== user.id) return;
  await prisma.exchange.update({ where: { id }, data: { status: "CANCELLED" } });
  revalidatePath(`/exchange/${id}`);
  revalidatePath("/me");
}

export async function leaveReview(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const exchangeId = String(formData.get("exchangeId") || "");
  const rating = num(formData.get("rating"));
  const comment = String(formData.get("comment") || "").trim();
  const exchange = await prisma.exchange.findUnique({ where: { id: exchangeId } });
  if (!exchange || exchange.status !== "COMPLETED") return;
  const toUserId = exchange.ownerId === user.id ? exchange.partnerId : exchange.ownerId;
  if (exchange.ownerId !== user.id && exchange.partnerId !== user.id) return;
  if (!rating || rating < 1 || rating > 5) return;

  await prisma.review.create({
    data: { exchangeId, fromUserId: user.id, toUserId, rating, comment },
  });
  revalidatePath(`/exchange/${exchangeId}`);
  revalidatePath(`/u/${toUserId}`);
}

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: String(formData.get("name") || user.name),
      location: String(formData.get("location") || user.location),
      bio: String(formData.get("bio") || ""),
      avatar: String(formData.get("avatar") || user.avatar || ""),
    },
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
