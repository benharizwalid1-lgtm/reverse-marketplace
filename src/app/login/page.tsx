"use client";

import Link from "next/link";
import { useState } from "react";
import { loginAction } from "@/lib/actions";

export default function LoginPage() {
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    const result = await loginAction(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <p className="text-[12px] uppercase tracking-[0.22em] text-[#A98BCB]">Welcome back</p>
      <h1 className="display mt-2 text-4xl">Sign in</h1>
      <form action={onSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required defaultValue="sofia@reverse.demo" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required defaultValue="reverse123" />
        </div>
        {error && <p className="text-sm text-[#E7A0A0]">{error}</p>}
        <button className="btn btn-primary w-full">Enter Reverse</button>
      </form>
      <p className="mt-6 text-sm text-[#B9B3C6]">
        Demo accounts are marked in the seed. Password: reverse123.{" "}
        <Link href="/signup" className="text-[#A98BCB]">
          Create an account
        </Link>
      </p>
    </div>
  );
}
