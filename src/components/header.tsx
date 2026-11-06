"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";

export function Header() {
  const { session, logout } = useStore();

  return (
    <header className="topbar">
      <div className="shell topbar-inner">
        <Link href="/" className="brand display">
          <span className="brand-mark">R</span>
          REVERSE
        </Link>
        <nav className="nav">
          <Link href="/#explore">Explore</Link>
          <Link href="/borrow">Borrow</Link>
          <Link href="/get">Get</Link>
          <Link href="/swap">Swap</Link>
          <Link href="/skill">Skill</Link>
          <Link href="/near">Near me</Link>
        </nav>
        <div className="topbar-actions">
          {session ? (
            <>
              <Link href="/me" style={{ color: "var(--mauve-light)" }}>
                My Reverse
              </Link>
              <button className="btn btn-ghost" onClick={logout}>
                Leave
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Sign in</Link>
              <Link href="/signup" className="btn btn-primary">
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
