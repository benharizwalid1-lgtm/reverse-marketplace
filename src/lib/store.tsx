"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import bcrypt from "bcryptjs";
import {
  createSeed,
  type Exchange,
  type Listing,
  type Message,
  type Proposal,
  type Review,
  type Store as DbStore,
  type User,
} from "./db";
import { borrowDeposit, estimateObjectValue, valueGap } from "./valuation";

const KEY = "reverse-store-v1";
const SESSION_KEY = "reverse-session-v1";

function revive(raw: DbStore): DbStore {
  const dates = <T extends { createdAt: string | Date }>(items: T[]) =>
    items.map((item) => ({ ...item, createdAt: new Date(item.createdAt) }));
  return {
    users: dates(raw.users),
    listings: dates(raw.listings),
    proposals: dates(raw.proposals).map((item) => ({ ...item, updatedAt: new Date(item.updatedAt) })),
    exchanges: dates(raw.exchanges).map((item) => ({
      ...item,
      startDate: new Date(item.startDate),
      returnDate: item.returnDate ? new Date(item.returnDate) : null,
    })),
    messages: dates(raw.messages),
    reviews: dates(raw.reviews),
  };
}

function readStore(): DbStore {
  if (typeof window === "undefined") return createSeed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return revive(JSON.parse(raw) as DbStore);
  } catch {
    /* keep seed */
  }
  const seed = createSeed();
  window.localStorage.setItem(KEY, JSON.stringify(seed));
  return seed;
}

function readSession(): { id: string; email: string; name: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as { id: string; email: string; name: string }) : null;
  } catch {
    return null;
  }
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

type Session = { id: string; email: string; name: string };

type StoreApi = {
  ready: boolean;
  session: Session | null;
  data: DbStore;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (input: { name: string; email: string; password: string; location: string }) => Promise<string | null>;
  logout: () => void;
  publish: (listing: Omit<Listing, "id" | "createdAt" | "status">) => string;
  removeListing: (id: string) => void;
  propose: (proposal: Omit<Proposal, "id" | "createdAt" | "updatedAt" | "status">) => string;
  decide: (id: string, decision: "ACCEPT" | "REJECT") => string | null;
  sendMessage: (input: { body: string; proposalId?: string | null; exchangeId?: string | null }) => void;
  confirmHandover: (id: string) => void;
  confirmReturn: (id: string) => void;
  cancelExchange: (id: string) => void;
  leaveReview: (input: { exchangeId: string; rating: number; comment: string }) => void;
  updateProfile: (input: Partial<User>) => void;
};

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DbStore>(createSeed);
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(readStore());
    setSession(readSession());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(KEY, JSON.stringify(data));
  }, [data, ready]);

  const api = useMemo<StoreApi>(() => {
    const saveSession = (value: Session | null) => {
      setSession(value);
      if (value) window.localStorage.setItem(SESSION_KEY, JSON.stringify(value));
      else window.localStorage.removeItem(SESSION_KEY);
    };

    return {
      ready,
      session,
      data,
      async login(email, password) {
        const user = data.users.find((item) => item.email === email.toLowerCase());
        if (!user) return "Those credentials don't match a REVERSE account.";
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return "Those credentials don't match a REVERSE account.";
        saveSession({ id: user.id, email: user.email, name: user.name });
        return null;
      },
      async signup(input) {
        if (data.users.some((item) => item.email === input.email.toLowerCase())) {
          return "An account with this email already exists.";
        }
        const user: User = {
          id: uid("user"),
          email: input.email.toLowerCase(),
          passwordHash: await bcrypt.hash(input.password, 8),
          name: input.name,
          location: input.location,
          bio: "",
          avatar: null,
          verified: false,
          reversePoints: 0,
          isDemo: false,
          createdAt: new Date(),
        };
        setData((current) => ({ ...current, users: [...current.users, user] }));
        saveSession({ id: user.id, email: user.email, name: user.name });
        return null;
      },
      logout() {
        saveSession(null);
      },
      publish(listing) {
        const id = uid("list");
        const created: Listing = { ...listing, id, status: "ACTIVE", createdAt: new Date() };
        setData((current) => ({ ...current, listings: [created, ...current.listings] }));
        return id;
      },
      removeListing(id) {
        setData((current) => ({ ...current, listings: current.listings.filter((item) => item.id !== id) }));
      },
      propose(proposal) {
        const id = uid("prop");
        const created: Proposal = {
          ...proposal,
          id,
          status: "PENDING",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setData((current) => ({ ...current, proposals: [created, ...current.proposals] }));
        return id;
      },
      decide(id, decision) {
        let exchangeId: string | null = null;
        setData((current) => {
          const proposal = current.proposals.find((item) => item.id === id);
          if (!proposal) return current;
          const listing = current.listings.find((item) => item.id === proposal.listingId);
          if (!listing) return current;
          if (decision === "REJECT") {
            return {
              ...current,
              proposals: current.proposals.map((item) =>
                item.id === id ? { ...item, status: "REJECTED", updatedAt: new Date() } : item,
              ),
            };
          }
          const created: Exchange = {
            id: uid("ex"),
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
            returnDate:
              listing.type === "BORROW" && proposal.durationDays
                ? new Date(Date.now() + proposal.durationDays * 24 * 60 * 60 * 1000)
                : null,
            ownerHandover: false,
            partnerHandover: false,
            ownerReturn: false,
            partnerReturn: false,
            createdAt: new Date(),
          };
          exchangeId = created.id;
          return {
            ...current,
            proposals: current.proposals.map((item) =>
              item.id === id ? { ...item, status: "ACCEPTED", updatedAt: new Date() } : item,
            ),
            listings: current.listings.map((item) =>
              item.id === listing.id && listing.type === "GET" ? { ...item, status: "CLOSED" } : item,
            ),
            exchanges: [created, ...current.exchanges],
            users: current.users.map((item) => {
              if (item.id === listing.userId) return { ...item, reversePoints: item.reversePoints + (listing.type === "GET" ? 25 : 15) };
              if (item.id === proposal.fromUserId) return { ...item, reversePoints: item.reversePoints + 10 };
              return item;
            }),
          };
        });
        return exchangeId;
      },
      sendMessage(input) {
        const message: Message = {
          id: uid("msg"),
          fromUserId: session?.id || "",
          body: input.body,
          proposalId: input.proposalId || null,
          exchangeId: input.exchangeId || null,
          createdAt: new Date(),
        };
        setData((current) => ({ ...current, messages: [...current.messages, message] }));
      },
      confirmHandover(id) {
        setData((current) => ({
          ...current,
          exchanges: current.exchanges.map((item) => {
            if (item.id !== id) return item;
            const next = {
              ...item,
              ownerHandover: item.ownerId === session?.id ? true : item.ownerHandover,
              partnerHandover: item.partnerId === session?.id ? true : item.partnerHandover,
            };
            next.status =
              next.ownerHandover && next.partnerHandover
                ? next.type === "BORROW"
                  ? "IN_PROGRESS"
                  : "COMPLETED"
                : "HANDOVER_PENDING";
            return next;
          }),
        }));
      },
      confirmReturn(id) {
        setData((current) => ({
          ...current,
          exchanges: current.exchanges.map((item) => {
            if (item.id !== id) return item;
            const next = {
              ...item,
              ownerReturn: item.ownerId === session?.id ? true : item.ownerReturn,
              partnerReturn: item.partnerId === session?.id ? true : item.partnerReturn,
            };
            next.status = next.ownerReturn && next.partnerReturn ? "COMPLETED" : "RETURN_PENDING";
            return next;
          }),
        }));
      },
      cancelExchange(id) {
        setData((current) => ({
          ...current,
          exchanges: current.exchanges.map((item) => (item.id === id ? { ...item, status: "CANCELLED" } : item)),
        }));
      },
      leaveReview(input) {
        if (!session) return;
        const exchange = data.exchanges.find((item) => item.id === input.exchangeId);
        if (!exchange) return;
        const review: Review = {
          id: uid("rev"),
          exchangeId: input.exchangeId,
          fromUserId: session.id,
          toUserId: exchange.ownerId === session.id ? exchange.partnerId : exchange.ownerId,
          rating: input.rating,
          comment: input.comment,
          createdAt: new Date(),
        };
        setData((current) => ({ ...current, reviews: [...current.reviews, review] }));
      },
      updateProfile(input) {
        if (!session) return;
        setData((current) => ({
          ...current,
          users: current.users.map((item) => (item.id === session.id ? { ...item, ...input } : item)),
        }));
      },
    };
  }, [data, ready, session]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("StoreProvider missing");
  return value;
}

export function useUser(id?: string | null) {
  const { data } = useStore();
  return data.users.find((item) => item.id === id) ?? null;
}

export { borrowDeposit, estimateObjectValue, valueGap };
