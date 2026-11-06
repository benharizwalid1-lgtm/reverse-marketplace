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
      <section className="shell hero">
        <p className="kicker">The market goes backwards</p>
        <h1 className="display">
          Stop buying.
          <br />
          <span style={{ color: "var(--mauve-light)" }}>Start finding.</span>
        </h1>
        <p className="lede">
          REVERSE begins with what you need. Borrow for a while, get something free, swap forever, or exchange a skill.
        </p>
        <div className="actions">
          <Link href="/#explore" className="btn btn-primary">
            Explore Reverse
          </Link>
          <Link href="/publish/borrow" className="btn btn-ghost">
            Publish a need
          </Link>
        </div>
      </section>

      <section id="explore" className="shell section">
        <p className="kicker" style={{ color: "var(--teal)" }}>
          Explore Reverse
        </p>
        <h2 className="display" style={{ fontSize: "2.4rem", marginTop: "0.6rem" }}>
          Four ways to reverse the market
        </h2>
        <div className="explore-grid">
          {MODES.map((mode) => {
            const meta = MODE_META[mode];
            return (
              <Link key={mode} href={`/${meta.slug}`} className="mode-card soft-panel hairline">
                <div className="mode-card-top">
                  <div className="mode-icon" style={{ background: meta.glow, color: meta.accent }}>
                    {mode === "BORROW" ? "↻" : mode === "GET" ? "○" : mode === "SWAP" ? "⇄" : "✦"}
                  </div>
                  <span style={{ color: "var(--mute)", fontSize: "0.9rem" }}>{meta.tagline}</span>
                </div>
                <h3 className="display" style={{ color: meta.accent }}>
                  {meta.label}
                </h3>
                <p>{meta.description}</p>
                <p style={{ marginTop: "1.4rem", color: "var(--ink)" }}>Open {meta.label} →</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="shell section">
        <div className="page-head">
          <h2 className="display" style={{ fontSize: "2rem" }}>
            Live on Reverse
          </h2>
          <Link href="/borrow" style={{ color: "var(--mauve-light)" }}>
            Browse all
          </Link>
        </div>
        <div className="listing-grid">
          {recent.slice(0, 6).map((listing) => (
            <ListingCard key={listing.id} listing={{ ...listing, user: users[listing.userId] }} />
          ))}
        </div>
      </section>

      {lastChance.length > 0 && (
        <section className="shell section">
          <p className="kicker" style={{ color: "var(--teal)" }}>
            The last chance
          </p>
          <h2 className="display" style={{ fontSize: "2rem", marginTop: "0.5rem" }}>
            Objects that might otherwise disappear
          </h2>
          <div className="listing-grid">
            {lastChance.map((listing) => (
              <ListingCard key={listing.id} listing={{ ...listing, user: users[listing.userId] }} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
