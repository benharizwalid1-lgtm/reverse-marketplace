import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-inner" style={{ display: "flex", gap: "1.5rem", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div>
          <p className="display" style={{ fontSize: "1.8rem" }}>
            REVERSE
          </p>
          <p className="lede" style={{ marginTop: "0.6rem" }}>
            Stop buying. Start finding. A marketplace that begins with what you need.
          </p>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", color: "var(--mute)" }}>
          <Link href="/last-chance">Last chance</Link>
          <Link href="/match">Match</Link>
          <Link href="/publish/borrow">Publish</Link>
        </div>
      </div>
    </footer>
  );
}
