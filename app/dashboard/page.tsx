"use client";

import Link from "next/link";
import { useState } from "react";

export default function DashboardPage() {
  // Placeholder “auth”
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="mt-3 text-sm text-zinc-600">
          Locked placeholder. Next step is real authentication + saved case data.
        </p>

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="text-sm font-semibold text-zinc-950">This area will become your command center.</div>
          <ul className="mt-4 space-y-2 text-sm text-zinc-700">
            <li>• Case intake wizard</li>
            <li>• Deadlines + reminders</li>
            <li>• Issue list + strategy plan</li>
            <li>• Document generation & exports</li>
          </ul>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => setUnlocked(true)}
              className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Enter demo dashboard
            </button>
            <Link
              href="/case"
              className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              Start case intake
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">THOXIE Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Demo UI. Next: connect real data + auth.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/case"
            className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            New Case
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            Home
          </Link>
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {[
          ["Case Status", "Start intake → build plan → export"],
          ["Deadlines", "Add dates, reminders, and hearing prep"],
          ["Strategy", "Issue list + priorities + next steps"],
        ].map(([title, body]) => (
          <div key={title} className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-sm font-semibold">{title}</div>
            <div className="mt-2 text-sm text-zinc-700">{body}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
