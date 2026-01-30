// PATH: app/page.tsx
"use client";

import Link from "next/link";
import CaseTypeSelector from "@/components/CaseTypeSelector";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-neutral-900">
              THOXIE
            </h1>
            <p className="mt-3 max-w-2xl text-neutral-700">
              Legal decision support and preparation.
            </p>
          </div>

          <Link
            href="/signup"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
          >
            Sign up
          </Link>
        </div>

        <CaseTypeSelector />
      </div>
    </main>
  );
}

