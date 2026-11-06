"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="display text-4xl">Something went wrong</h1>
      <p className="mt-3 text-[#B9B3C6]">Reload this page to continue on Reverse.</p>
      <button className="btn btn-primary mt-8" onClick={() => reset()}>
        Reload
      </button>
    </div>
  );
}
