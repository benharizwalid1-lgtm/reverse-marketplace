import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/5">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 text-sm text-[#B9B3C6] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="display text-2xl text-[#F7F5FA]">REVERSE</p>
          <p className="mt-2 max-w-sm">Stop buying. Start finding. A marketplace that begins with what you need.</p>
        </div>
        <div className="flex gap-6">
          <Link href="/last-chance">Last chance</Link>
          <Link href="/match">Match</Link>
          <Link href="/publish/borrow">Publish</Link>
        </div>
      </div>
    </footer>
  );
}
