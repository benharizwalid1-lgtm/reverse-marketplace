import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="display text-5xl">Nothing here</h1>
      <p className="mt-4 text-[#B9B3C6]">This page doesn’t exist on Reverse.</p>
      <Link href="/" className="btn btn-primary mt-8">
        Back home
      </Link>
    </div>
  );
}
