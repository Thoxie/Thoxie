import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Show, UserButton } from "@clerk/react";
import { Sparkles } from "lucide-react";

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
    <div className="min-h-[100dvh] flex flex-col bg-white text-foreground">
      <header className="sticky top-0 z-40 w-full bg-white shadow-sm">
        <div className="container mx-auto px-6 h-[106px] flex items-center justify-between">
          <Link href="/" className="flex items-center shrink-0">
            <img src={`${basePath}/logo.png`} alt="Small Claims Genie" className="h-[92px] w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? location === "/" : location.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors hover:text-primary hover:bg-gray-100 ${
                    isActive
                      ? "text-primary bg-gray-100"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <Link href="/dashboard" className="hidden sm:flex text-muted-foreground hover:text-primary font-semibold text-sm px-3 py-2">
                Resume Your Case
              </Link>
              <Link href="/sign-up" className="inline-flex h-9 items-center justify-center rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold shadow-sm px-5 text-sm">
                <Sparkles className="mr-1.5 h-4 w-4" />
                Start Your Case
              </Link>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard" className="hidden sm:flex text-muted-foreground hover:text-primary font-semibold text-sm px-3 py-2">
                Resume Your Case
              </Link>
              <Link href="/cases/new" className="inline-flex h-9 items-center justify-center rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold shadow-sm px-5 text-sm">
                <Sparkles className="mr-1.5 h-4 w-4" />
                Start Your Case
              </Link>
              <UserButton afterSignOutUrl="/sign-in" />
            </Show>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="border-t py-8" style={{ backgroundColor: "#ddf6f3" }}>
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-sm text-primary/60">
              &copy; {new Date().getFullYear()} Small Claims Genie. Not a law firm. Legal advice only.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="text-sm text-primary/60 hover:text-primary underline underline-offset-2 transition-colors">
                Terms of Use
              </Link>
              <Link href="/tos" className="text-sm text-primary/60 hover:text-primary underline underline-offset-2 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
