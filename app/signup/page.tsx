// PATH: app/signup/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type FormState = {
  email: string;
  password: string;
  confirm: string;
  fullName: string;
};

export default function SignupPage() {
  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    confirm: "",
    fullName: "",
  });

  const [status, setStatus] = useState<string>("");

  const canSubmit = useMemo(() => {
    if (!form.email.trim()) return false;
    if (!form.password) return false;
    if (form.password.length < 8) return false;
    if (form.password !== form.confirm) return false;
    return true;
  }, [form]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Restore target: signup is UI-only. Authentication not enabled.");
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-md px-6 py-14">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Create an account
            </h1>
            <p className="mt-2 text-sm text-neutral-700">
              Restore target: this is a front-end form only.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
          >
            Home
          </Link>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-sm text-neutral-800">Full name</label>
            <input
              className="mt-1 h-10 w-full rounded-md border border-neutral-300 px-3 text-sm"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="e.g., Jane Smith"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-800">Email</label>
            <input
              className="mt-1 h-10 w-full rounded-md border border-neutral-300 px-3 text-sm"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="name@email.com"
              inputMode="email"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-800">Password</label>
            <input
              className="mt-1 h-10 w-full rounded-md border border-neutral-300 px-3 text-sm"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              type="password"
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-800">Confirm password</label>
            <input
              className="mt-1 h-10 w-full rounded-md border border-neutral-300 px-3 text-sm"
              value={form.confirm}
              onChange={(e) => update("confirm", e.target.value)}
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter password"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-2 w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            Create account
          </button>

          {status ? (
            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-800">
              {status}
            </div>
          ) : null}

          <div className="text-sm text-neutral-700">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}





