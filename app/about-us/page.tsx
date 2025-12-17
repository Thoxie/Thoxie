import Link from "next/link";

export default function About() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">About THOXIE - AI Self-Representing</h1>

      <p className="mt-6 text-zinc-700 leading-relaxed">
        THOXIE is built for people going through divorce in California who refuse to lose
        because they were outprepared. Most outcomes aren’t decided by a single “gotcha.”
        They’re decided by who shows up organized, focused, and ready — with the right facts,
        the right documents, and a clear plan.
      </p>

      <p className="mt-4 text-zinc-700 leading-relaxed">
        The traditional system is slow and expensive. You pay for time, wait for updates, and
        end up making decisions under stress. THOXIE flips that. It’s designed to help you move
        fast, stay structured, and keep momentum — so you’re not reacting. You’re executing a strategy.
      </p>

      <p className="mt-4 text-zinc-700 leading-relaxed">
        THOXIE helps you organize issues, timelines, and priorities; keep your case materials in one place;
        and generate structured summaries and next steps so you can stay ahead. It’s built to be simple enough
        for normal people — not lawyers — while still feeling sharp, modern, and powerful.
      </p>

      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <span className="font-semibold">Important:</span> THOXIE is not a law firm and does not provide legal advice.
        THOXIE is a legal support and preparation tool. If you need legal advice, consult a licensed attorney.
      </div>

      <div className="mt-10">
        <Link
          href="/"
          className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
