import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Contact</h1>

      <p className="mt-6 text-zinc-700">
        Want early access, partnerships, or press? Send a note.
      </p>

      <div className="mt-8 rounded-2xl border border-zinc-200 p-6">
        <div className="text-sm font-semibold">Email</div>
        <p className="mt-2 text-sm text-zinc-700">
          <a className="underline hover:text-zinc-950" href="mailto:hello@thoxie.com">
            info@thoxie.com
          </a>
        </p>

        <div className="mt-6 text-xs text-zinc-600">
        </div>
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
