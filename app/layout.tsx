import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "THOXIE — Win your case",
  description:
    "THOXIE is a legal support and preparation tool built for California. Not a law firm. No legal advice.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-white text-zinc-950">
        <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/thoxie-logo.png.png"
                alt="THOXIE"
                width={220}
                height={70}
                priority
                className="h-12 w-auto"
              />
              <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
                California
              </span>
            </Link>

            <nav className="hidden items-center gap-6 text-sm text-zinc-700 md:flex">
              <Link href="/#win" className="hover:text-zinc-950">
                Win your case
              </Link>
              <Link href="/#compare" className="hover:text-zinc-950">
                THOXIE vs Attorney
              </Link>
              <Link href="/#flow" className="hover:text-zinc-950">
                Go with the flow
              </Link>
              <Link href="/#pricing" className="hover:text-zinc-950">

