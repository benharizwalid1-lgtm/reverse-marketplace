import { prisma } from "./prisma";
import { trustScore } from "./format";
import type { Mode } from "./modes";

export async function listListings(params: {
  type?: Mode;
  q?: string;
  location?: string;
  lastChance?: boolean;
  near?: string;
}) {
  return prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      type: params.type,
      lastChance: params.lastChance ? true : undefined,
      location: params.location || params.near || undefined,
      OR: params.q
        ? [
            { needTitle: { contains: params.q } },
            { offerTitle: { contains: params.q } },
            { needDescription: { contains: params.q } },
            { offerDescription: { contains: params.q } },
            { brand: { contains: params.q } },
            { category: { contains: params.q } },
          ]
        : undefined,
    },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getListing(id: string) {
  return prisma.listing.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          reviewsReceived: true,
          ownedExchanges: true,
          partnerExchanges: true,
        },
      },
      proposals: {
        include: { fromUser: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export function profileStats(user: {
  verified: boolean;
  reversePoints: number;
  reviewsReceived: { rating: number }[];
  ownedExchanges: { status: string }[];
  partnerExchanges: { status: string }[];
}) {
  const completed = [...user.ownedExchanges, ...user.partnerExchanges].filter(
    (item) => item.status === "COMPLETED",
  ).length;
  const avgRating =
    user.reviewsReceived.length === 0
      ? null
      : user.reviewsReceived.reduce((sum, review) => sum + review.rating, 0) /
        user.reviewsReceived.length;
  return {
    completed,
    avgRating,
    trust: trustScore({
      verified: user.verified,
      completed,
      avgRating,
      reversePoints: user.reversePoints,
    }),
  };
}

export async function matchListings(userId: string) {
  const mine = await prisma.listing.findMany({
    where: { userId, status: "ACTIVE" },
  });
  const others = await prisma.listing.findMany({
    where: { userId: { not: userId }, status: "ACTIVE" },
    include: { user: true },
  });

  const tokens = (text: string) =>
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((part) => part.length > 2);

  return others
    .map((listing) => {
      let score = 0;
      for (const mineListing of mine) {
        if (mineListing.type !== listing.type) continue;
        const need = tokens(`${mineListing.needTitle} ${mineListing.needDescription}`);
        const offer = tokens(`${listing.offerTitle} ${listing.offerDescription}`);
        const reverseNeed = tokens(`${listing.needTitle} ${listing.needDescription}`);
        const reverseOffer = tokens(`${mineListing.offerTitle} ${mineListing.offerDescription}`);
        score += need.filter((word) => offer.includes(word)).length * 3;
        score += reverseNeed.filter((word) => reverseOffer.includes(word)).length * 3;
        if (mineListing.location === listing.location) score += 2;
      }
      return { listing, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((item) => item.listing);
}

export async function dashboard(userId: string) {
  const [listings, sent, received, exchanges] = await Promise.all([
    prisma.listing.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.proposal.findMany({
      where: { fromUserId: userId },
      include: { listing: true, fromUser: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.proposal.findMany({
      where: { listing: { userId } },
      include: { listing: true, fromUser: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.exchange.findMany({
      where: { OR: [{ ownerId: userId }, { partnerId: userId }] },
      include: {
        owner: true,
        partner: true,
        listing: true,
        reviews: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { listings, sent, received, exchanges };
}

export async function getExchange(id: string) {
  return prisma.exchange.findUnique({
    where: { id },
    include: {
      owner: true,
      partner: true,
      listing: true,
      proposal: true,
      messages: { include: { fromUser: true }, orderBy: { createdAt: "asc" } },
      reviews: true,
    },
  });
}

export async function getProposalThread(id: string) {
  return prisma.proposal.findUnique({
    where: { id },
    include: {
      listing: { include: { user: true } },
      fromUser: true,
      messages: { include: { fromUser: true }, orderBy: { createdAt: "asc" } },
      exchange: true,
    },
  });
}
