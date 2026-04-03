import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Show, UserButton } from "@clerk/react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/types-of-cases", label: "Types of Cases" },
  { href: "/faq", label: "FAQ" },
  { href: "/resources", label: "Resources" },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src={`${basePath}/logo.png`} alt="Small Claims Genie" className="h-12 w-auto" />
          </Link>
          
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? location === "/" : location.startsWith(link.href.replace(/#.*/, "")) && link.href !== "/";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                    isActive
                      ? "text-navy border-b-2 border-navy"
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          
          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <Link href="/dashboard" className="hidden sm:inline-flex text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors px-3 py-2">
                Resume Your Case
              </Link>
              <Link href="/sign-up" className="inline-flex h-9 items-center justify-center rounded-full bg-orange px-5 text-sm font-bold text-white shadow hover:opacity-90 transition-opacity">
                Start Your Case
              </Link>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard" className="hidden sm:inline-flex text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors px-3 py-2">
                Resume Your Case
              </Link>
              <Link href="/start-case" className="inline-flex h-9 items-center justify-center rounded-full bg-orange px-5 text-sm font-bold text-white shadow hover:opacity-90 transition-opacity">
                Start Your Case
              </Link>
              <UserButton />
            </Show>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="bg-navy text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <img src={`${basePath}/logo.png`} alt="Small Claims Genie" className="h-10 w-auto brightness-200 mb-3" />
              <p className="text-sm text-white/60 max-w-xs">
                Professional guided preparation for California Small Claims Court. Not a law firm.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-8">
              <div>
                <h4 className="font-bold text-sm mb-3">Navigate</h4>
                <div className="flex flex-col gap-2 text-sm text-white/70">
                  <Link href="/" className="hover:text-white">Home</Link>
                  <Link href="/faq" className="hover:text-white">FAQ</Link>
                  <Link href="/resources" className="hover:text-white">Resources</Link>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-3">Legal</h4>
                <div className="flex flex-col gap-2 text-sm text-white/70">
                  <Link href="/disclaimers" className="hover:text-white">Disclaimers</Link>
                  <Link href="/contact" className="hover:text-white">Contact</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs text-white/40">
            &copy; {new Date().getFullYear()} Small Claims Genie. All rights reserved. Not a law firm.
          </div>
        </div>
      </footer>
    </div>
  );
}
