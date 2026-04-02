import { Link, useLocation } from "wouter";
import { Scale, Home, FileText, PlusCircle, Settings, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/claims/new", label: "New Claim", icon: PlusCircle },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground p-2 rounded-lg">
            <Scale size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg leading-tight tracking-tight">Small Claims</h1>
            <p className="text-sidebar-foreground/70 text-xs font-medium">Genie</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-4 px-2">Menu</div>
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 mt-auto">
          <div className="bg-sidebar-accent/50 rounded-xl p-4 border border-sidebar-border">
            <div className="flex items-center gap-2 mb-2 text-sidebar-foreground">
              <HelpCircle size={16} />
              <span className="font-medium text-sm">Need help?</span>
            </div>
            <p className="text-xs text-sidebar-foreground/70 mb-3 leading-relaxed">
              Filing a claim can be confusing. Our guides can help you prepare.
            </p>
            <button className="w-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white py-2 rounded-md transition-colors">
              View Guide
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
