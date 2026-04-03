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
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
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
              <Link href="/cases/new" className="inline-flex h-9 items-center justify-center rounded-full bg-orange px-5 text-sm font-bold text-white shadow hover:opacity-90 transition-opacity">
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
      <footer className="py-8" style={{ backgroundColor: "#ddf6f3" }}>
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-sm text-primary/60">
              &copy; {new Date().getFullYear()} Small Claims Genie. Not a law firm.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/disclaimers" className="text-sm text-primary/60 hover:text-primary underline underline-offset-2 transition-colors">
                Disclaimers
              </Link>
              <Link href="/contact" className="text-sm text-primary/60 hover:text-primary underline underline-offset-2 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
