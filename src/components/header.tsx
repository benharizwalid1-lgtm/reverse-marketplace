import Link from "next/link";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/lib/actions";

export async function Header() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#121016]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="display flex items-center gap-3 text-xl">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#7953A6] text-sm">R</span>
          REVERSE
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-[#B9B3C6] md:flex">
          <Link href="/#explore">Explore</Link>
          <Link href="/borrow">Borrow</Link>
          <Link href="/get">Get</Link>
          <Link href="/swap">Swap</Link>
          <Link href="/skill">Skill</Link>
          <Link href="/near">Near me</Link>
        </nav>
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link href="/me" className="text-sm text-[#A98BCB]">
                My Reverse
              </Link>
              <form action={logoutAction}>
                <button className="btn btn-ghost px-4 py-2 text-sm">Leave</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-[#B9B3C6]">
                Sign in
              </Link>
              <Link href="/signup" className="btn btn-primary px-4 py-2 text-sm">
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
