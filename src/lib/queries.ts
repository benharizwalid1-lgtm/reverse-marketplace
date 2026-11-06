import { trustScore } from "./format";
import type { Mode } from "./modes";
import { db, findUserById, hydrateUser, withUser } from "./db";

export async function listListings(params: {
  type?: Mode;
  q?: string;
  location?: string;
  lastChance?: boolean;
  near?: string;
}) {
  const q = params.q?.toLowerCase();
  const location = params.location || params.near;
  return db()
    .listings.filter((listing) => {
      if (listing.status !== "ACTIVE") return false;
      if (params.type && listing.type !== params.type) return false;
      if (params.lastChance && !listing.lastChance) return false;
      if (location && listing.location !== location) return false;
      if (
        q &&
        ![listing.needTitle, listing.offerTitle, listing.needDescription, listing.offerDescription, listing.brand, listing.category]
          .join(" ")
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((listing) => withUser(listing));
}

export async function getListing(id: string) {
  const listing = db().listings.find((item) => item.id === id);
  if (!listing) return null;
  const user = findUserById(listing.userId);
  if (!user) return null;
  const proposals = db()
    .proposals.filter((item) => item.listingId === id)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((proposal) => ({ ...proposal, fromUser: findUserById(proposal.fromUserId)! }));
  return {
    ...listing,
    user: hydrateUser(user),
    proposals,
  };
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
  const mine = db().listings.filter((item) => item.userId === userId && item.status === "ACTIVE");
  const others = db().listings.filter((item) => item.userId !== userId && item.status === "ACTIVE");
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
      return { listing: withUser(listing), score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((item) => item.listing);
}

export async function dashboard(userId: string) {
  const listings = db()
    .listings.filter((item) => item.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const sent = db()
    .proposals.filter((item) => item.fromUserId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((proposal) => ({
      ...proposal,
      fromUser: findUserById(proposal.fromUserId)!,
      listing: db().listings.find((item) => item.id === proposal.listingId)!,
    }));
  const received = db()
    .proposals.filter((item) => db().listings.find((listing) => listing.id === item.listingId)?.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((proposal) => ({
      ...proposal,
      fromUser: findUserById(proposal.fromUserId)!,
      listing: db().listings.find((item) => item.id === proposal.listingId)!,
    }));
  const exchanges = db()
    .exchanges.filter((item) => item.ownerId === userId || item.partnerId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((exchange) => ({
      ...exchange,
      owner: findUserById(exchange.ownerId)!,
      partner: findUserById(exchange.partnerId)!,
      listing: db().listings.find((item) => item.id === exchange.listingId)!,
      reviews: db().reviews.filter((item) => item.exchangeId === exchange.id),
    }));
  return { listings, sent, received, exchanges };
}

export async function getExchange(id: string) {
  const exchange = db().exchanges.find((item) => item.id === id);
  if (!exchange) return null;
  return {
    ...exchange,
    owner: findUserById(exchange.ownerId)!,
    partner: findUserById(exchange.partnerId)!,
    listing: db().listings.find((item) => item.id === exchange.listingId)!,
    proposal: db().proposals.find((item) => item.id === exchange.proposalId)!,
    messages: db()
      .messages.filter((item) => item.exchangeId === id)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((message) => ({ ...message, fromUser: findUserById(message.fromUserId)! })),
    reviews: db().reviews.filter((item) => item.exchangeId === id),
  };
}

export async function getProposalThread(id: string) {
  const proposal = db().proposals.find((item) => item.id === id);
  if (!proposal) return null;
  const listing = db().listings.find((item) => item.id === proposal.listingId);
  if (!listing) return null;
  return {
    ...proposal,
    listing: { ...listing, user: findUserById(listing.userId)! },
    fromUser: findUserById(proposal.fromUserId)!,
    messages: db()
      .messages.filter((item) => item.proposalId === id)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((message) => ({ ...message, fromUser: findUserById(message.fromUserId)! })),
    exchange: db().exchanges.find((item) => item.proposalId === id) ?? null,
  };
}

export async function getProfile(id: string) {
  const user = findUserById(id);
  if (!user) return null;
  const hydrated = hydrateUser(user);
  const listings = db()
    .listings.filter((item) => item.userId === id && item.status === "ACTIVE")
    .map((listing) => withUser(listing));
  const reviewsReceived = hydrated.reviewsReceived
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((review) => ({ ...review, fromUser: findUserById(review.fromUserId)! }));
  return { ...hydrated, listings, reviewsReceived };
}
