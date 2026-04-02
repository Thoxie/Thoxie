import { ReactNode } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";
import { Show } from "@clerk/react";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <Scale className="h-6 w-6 text-accent" />
            <span className="text-xl font-bold tracking-tight">Small Claims Genie</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/court" className="transition-colors hover:text-accent text-foreground/80">Court Info</Link>
            <Link href="/faq" className="transition-colors hover:text-accent text-foreground/80">FAQ</Link>
            <Link href="/contact" className="transition-colors hover:text-accent text-foreground/80">Contact</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <Show when="signed-out">
              <Link href="/sign-in" className="text-sm font-medium transition-colors hover:text-primary hidden sm:block">
                Sign In
              </Link>
              <Link href="/sign-up" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                Get Started
              </Link>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                Dashboard
              </Link>
            </Show>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="border-t bg-muted/40 py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-primary">
            <Scale className="h-5 w-5 text-accent" />
            <span className="font-semibold">Small Claims Genie</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/court" className="hover:text-foreground">Court Info</Link>
            <Link href="/faq" className="hover:text-foreground">FAQ</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
            <Link href="/disclaimers" className="hover:text-foreground">Disclaimers</Link>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Small Claims Genie. Not a law firm.
          </p>
        </div>
      </footer>
    </div>
  );
}
