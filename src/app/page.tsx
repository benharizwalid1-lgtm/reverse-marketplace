"use client";

import Link from "next/link";
import { MODE_META, MODES } from "@/lib/modes";
import { ListingCard } from "@/components/listing-card";
import { useStore } from "@/lib/store";

export default function Home() {
  const { data } = useStore();
  const recent = data.listings.filter((item) => item.status === "ACTIVE");
  const lastChance = recent.filter((item) => item.lastChance);
  const users = Object.fromEntries(data.users.map((user) => [user.id, user]));

  return (
    <div>
      <section className="mx-auto max-w-6xl px-5 pb-8 pt-16 md:pt-24">
        <p className="text-[12px] uppercase tracking-[0.28em] text-[#A98BCB]">The market goes backwards</p>
        <h1 className="display mt-4 max-w-4xl text-5xl leading-[0.95] md:text-7xl">
          Stop buying.
          <br />
          <span className="text-[#A98BCB]">Start finding.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-[#B9B3C6]">
          REVERSE begins with what you need. Borrow for a while, get something free, swap forever, or exchange a skill.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/#explore" className="btn btn-primary">
            Explore Reverse
          </Link>
          <Link href="/publish/borrow" className="btn btn-ghost">
            Publish a need
          </Link>
        </div>
      </section>

      <section id="explore" className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-[12px] uppercase tracking-[0.22em] text-[#36C6BB]">Explore Reverse</p>
        <h2 className="display mt-2 text-4xl">Four ways to reverse the market</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {MODES.map((mode) => {
            const meta = MODE_META[mode];
            return (
              <Link
                key={mode}
                href={`/${meta.slug}`}
                className="soft-panel hairline group rounded-[2.2rem] p-7 transition hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="grid h-14 w-14 place-items-center rounded-full text-lg"
                    style={{ background: meta.glow, color: meta.accent }}
                  >
                    {mode === "BORROW" ? "↻" : mode === "GET" ? "○" : mode === "SWAP" ? "⇄" : "✦"}
                  </div>
                  <span className="text-sm text-[#B9B3C6]">{meta.tagline}</span>
                </div>
                <h3 className="display mt-8 text-4xl" style={{ color: meta.accent }}>
                  {meta.label}
                </h3>
                <p className="mt-3 max-w-md text-[#B9B3C6]">{meta.description}</p>
                <p className="mt-6 text-sm text-[#F7F5FA]">Open {meta.label} →</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="display text-3xl">Live on Reverse</h2>
          <Link href="/borrow" className="text-sm text-[#A98BCB]">
            Browse all
          </Link>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {recent.slice(0, 6).map((listing) => (
            <ListingCard key={listing.id} listing={{ ...listing, user: users[listing.userId] }} />
          ))}
        </div>
      </section>

      {lastChance.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-16">
          <p className="text-[12px] uppercase tracking-[0.22em] text-[#36C6BB]">The last chance</p>
          <h2 className="display mt-2 text-3xl">Objects that might otherwise disappear</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {lastChance.map((listing) => (
              <ListingCard key={listing.id} listing={{ ...listing, user: users[listing.userId] }} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
