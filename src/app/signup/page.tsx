"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";

export default function SignupPage() {
  const { signup } = useStore();
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await signup({
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
      location: String(form.get("location") || ""),
    });
    if (result) setError(result);
    else router.push("/me");
  }

  return (
    <div className="form-page">
      <p className="text-[12px] uppercase tracking-[0.22em] text-[#36C6BB]">New here</p>
      <h1 className="display mt-2 text-4xl">Create a profile</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="name">Name</label>
          <input id="name" name="name" required />
        </div>
        <div>
          <label htmlFor="location">Location</label>
          <input id="location" name="location" required placeholder="Tunis" />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" minLength={6} required />
        </div>
        {error && <p className="text-sm text-[#E7A0A0]">{error}</p>}
        <button className="btn btn-primary w-full">Join Reverse</button>
      </form>
      <p className="mt-6 text-sm text-[#B9B3C6]">
        Already have an account?{" "}
        <Link href="/login" className="text-[#A98BCB]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
