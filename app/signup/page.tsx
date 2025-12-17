"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [typedName, setTypedName] = useState("");
  const [agree, setAgree] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const normalizedFullName = useMemo(
    () => fullName.trim().replace(/\s+/g, " "),
    [fullName]
  );
  const normalizedTypedName = useMemo(
    () => typedName.trim().replace(/\s+/g, " "),
    [typedName]
  );

  const canSubmit =
    email.trim().length > 3 &&
    normalizedFullName.length >= 3 &&
    agree &&
    normalizedTypedName.length >= 3 &&
    normalizedTypedName.toLowerCase() === normalizedFullName.toLowerCase();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    // Placeholder: Later we’ll send this to your auth/backend and store acceptance + signature.
    setSubmitted(true);
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Create your THOXIE account</h1>
      <p className="mt-3 text-sm text-zinc-600">
        California launch. Start free. No credit card required.
      </p>

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
        {submitted ? (
          <div>
            <div className="text-sm font-semibold text-zinc-950">You’re set (demo state).</div>
            <p className="mt-2 text-sm text-zinc-700">
              Next step: we’ll wire real signup + storing Terms acceptance. For now, go to your dashboard.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/dashboard"
                className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/"
                className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
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

            <div>
              <label className="text-sm font-semibold text-zinc-900">Full legal name (for signature)</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                type="text"
                placeholder="First Last"
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-950"
              />
              <p className="mt-2 text-xs text-zinc-600">
                This is for your Terms acceptance signature. We’ll store it when we add the backend.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <div className="text-sm font-semibold text-zinc-950">Terms acceptance (required)</div>
              <p className="mt-2 text-sm text-zinc-700">
                THOXIE is not a law firm and does not provide legal advice. By continuing, you agree to the Terms.
              </p>

              <div className="mt-4 flex items-start gap-3">
                <input
                  id="agree"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-zinc-300"
                />
                <label htmlFor="agree" className="text-sm text-zinc-800">
                  I agree to the{" "}
                  <Link href="/terms" className="underline hover:text-zinc-950">
                    Terms & Conditions
                  </Link>
                  .
                </label>
              </div>

              <div className="mt-4">
                <label className="text-sm font-semibold text-zinc-900">Type your full name to sign</label>
                <input
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  type="text"
                  placeholder={normalizedFullName || "Type the same name as above"}
                  className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-950"
                />
                <p className="mt-2 text-xs text-zinc-600">
                  Must match the “Full legal name” field exactly (case-insensitive).
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Create account
            </button>

            <div className="text-center text-sm text-zinc-700">
              Already have an account?{" "}
              <Link href="/login" className="underline hover:text-zinc-950">
                Log in
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
