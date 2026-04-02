import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Scale, Home, LayoutDashboard, Building2, HelpCircle, Mail, FileText, Menu } from "lucide-react";
import { useUser, useClerk } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AskGenie } from "@/components/AskGenie";

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Court Info", href: "/court", icon: Building2 },
    { label: "FAQ", href: "/faq", icon: HelpCircle },
    { label: "Contact", href: "/contact", icon: Mail },
    { label: "Disclaimers", href: "/disclaimers", icon: FileText },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="bg-sidebar-primary p-1.5 rounded-md">
            <Scale className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">Genie</span>
        </Link>
      </div>

      <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        <div className="mb-4 px-2 text-xs font-semibold text-sidebar-foreground/50 tracking-wider uppercase">Menu</div>
        {navItems.map((item) => {
          const isActive = location === item.href || location.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-sidebar-primary" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <Avatar className="h-9 w-9 border border-sidebar-border">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
              {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">{user?.fullName || "User"}</span>
            <span className="text-xs text-sidebar-foreground/60 truncate">{user?.primaryEmailAddress?.emailAddress}</span>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start text-sidebar-foreground border-sidebar-border bg-transparent hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => signOut()}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[100dvh] bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col md:pl-64">
        <header className="md:hidden sticky top-0 z-40 flex h-16 items-center border-b bg-background px-4 justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-accent" />
            <span className="font-bold text-primary">Small Claims Genie</span>
          </Link>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Floating Ask Genie Button */}
      <AskGenie />
    </div>
  );
}
