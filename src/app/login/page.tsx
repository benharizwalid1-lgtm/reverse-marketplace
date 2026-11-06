"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const { login } = useStore();
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await login(String(form.get("email") || ""), String(form.get("password") || ""));
    if (result) setError(result);
    else router.push("/me");
  }

  return (
    <div className="form-page">
      <p className="text-[12px] uppercase tracking-[0.22em] text-[#A98BCB]">Welcome back</p>
      <h1 className="display mt-2 text-4xl">Sign in</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
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
        Demo password: reverse123.{" "}
        <Link href="/signup" className="text-[#A98BCB]">
          Create an account
        </Link>
      </p>
    </div>
  );
}
