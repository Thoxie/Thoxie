import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import CaseTypeSelector from "../components/CaseTypeSelector";
import "./globals.css";

export const metadata: Metadata = {
  title: "THOXIE",
  description: "Family-law decision-support (not a law firm).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-zinc-950">
        <header className="border-b border-zinc-200">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/thoxie-logo.png"
                alt="THOXIE"
                width={36}
                height={36}
                priority
              />
              <span className="font-semibold tracking-tight">THOXIE</span>
            </Link>

            <nav className="flex items-center gap-4 text-sm">
              <Link href="/about-us" className="hover:underline">
                About
              </Link>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
              <Link href="/dashboard" className="hover:underline">
                Dashboard
              </Link>
              <Link href="/login" className="hover:underline">
                Login
              </Link>
              <Link href="/signup" className="hover:underline">
                Sign up
              </Link>
            </nav>
          </div>

          <div className="mx-auto max-w-6xl px-4 pb-4">
            <CaseTypeSelector />
          </div>
        </header>

        {children}

        <footer className="border-t border-zinc-200 mt-16">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-zinc-600">
            THOXIE provides decision-support and organization help. Not legal advice.
          </div>
        </footer>
      </body>
    </html>
  );
}

