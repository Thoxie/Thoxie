"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder. Later: real auth.
    window.location.href = "/dashboard";
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Log in</h1>
      <p className="mt-3 text-sm text-zinc-600">Demo mode. We’ll wire real auth next.</p>

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-zinc-900">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@domain.com"
              className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-950"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Continue
          </button>

          <div className="flex items-center justify-between text-sm">
            <Link href="/signup" className="underline hover:text-zinc-950">
              Create account
            </Link>
            <Link href="/" className="underline hover:text-zinc-950">
              Back to Home
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
