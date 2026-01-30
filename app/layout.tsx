// PATH: app/layout.tsx

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import CaseTypeSelector from "../components/CaseTypeSelector";
import "./globals.css";

export const metadata: Metadata = {
  title: "THOXIE",
  description: "Legal decision support and preparation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-zinc-950">
        {/* Top Nav */}
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="relative h-7 w-7 overflow-hidden rounded-md bg-zinc-950">
                  <Image
                    src="/favicon.ico"
                    alt="THOXIE"
                    fill
                    className="object-contain"
                    sizes="28px"
                    priority
                  />
                </span>
                <span className="text-sm font-semibold tracking-wide">THOXIE</span>
              </Link>
            </div>

            <nav className="flex items-center gap-3">
              <Link
                href="/about-us"
                className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
              >
                Contact
              </Link>
              <Link
                href="/signup"
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
              >
                Sign up
              </Link>
              <Link
                href="/dashboard"
                className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </header>

        {/* Sub Header: workflow selector (Family Law only) */}
        <div className="border-b border-zinc-200 bg-zinc-50">
          <div className="mx-auto max-w-6xl px-6 py-4">
            <CaseTypeSelector compact />
          </div>
        </div>

        {children}

        <footer className="border-t border-zinc-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="text-sm text-zinc-600">
              THOXIE is a decision-support tool. It does not provide legal representation.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
