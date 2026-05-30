import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Video, Image as ImageIcon, Music, Mic, UserSquare2,
  FolderOpen, Sparkles, CreditCard, Settings as SettingsIcon, Search, Bell, Plus, Menu,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const nav = [
  { section: "Workspace", items: [
    { to: "/app", icon: LayoutDashboard, label: "Overview", end: true },
    { to: "/app/projects", icon: FolderOpen, label: "Projects" },
    { to: "/app/templates", icon: Sparkles, label: "Templates" },
  ]},
  { section: "Studios", items: [
    { to: "/app/video", icon: Video, label: "Video", badge: "Veo" },
    { to: "/app/image", icon: ImageIcon, label: "Image" },
    { to: "/app/music", icon: Music, label: "Music" },
    { to: "/app/voice", icon: Mic, label: "Voice" },
    { to: "/app/avatar", icon: UserSquare2, label: "Avatar", badge: "New" },
  ]},
  { section: "Account", items: [
    { to: "/app/billing", icon: CreditCard, label: "Billing" },
    { to: "/app/settings", icon: SettingsIcon, label: "Settings" },
  ]},
];

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
  <>
    <div className="px-5 py-4 border-b border-border/60">
      <Logo />
    </div>
    <div className="px-3 py-4 border-b border-border/60">
      <Button className="w-full bg-gradient-primary text-primary-foreground border-0 shadow-glow justify-start">
        <Plus className="h-4 w-4 mr-2" /> New project
      </Button>
    </div>
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
      {nav.map((g) => (
        <div key={g.section}>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 mb-2">{g.section}</p>
          <div className="space-y-0.5">
            {g.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-primary/15 text-foreground border-l-2 border-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-gradient-primary text-primary-foreground">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
    <div className="border-t border-border/60 p-4 space-y-3">
      <div className="glass rounded-lg p-3 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Credits</span>
          <span className="font-mono">2,140 / 3,000</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-gradient-primary" style={{ width: "71%" }} />
        </div>
        <button className="text-xs text-primary-glow hover:underline">Upgrade plan →</button>
      </div>
    </div>
  </>
);

const DashboardLayout = () => {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-border/60 flex-col bg-sidebar shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border/60 px-3 sm:px-6 flex items-center gap-2 sm:gap-4 sticky top-0 bg-background/80 backdrop-blur-xl z-30">
          {/* Mobile menu trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 bg-sidebar border-border/60 flex flex-col">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search…" className="pl-9 bg-muted/30 border-border/60" />
          </div>
          <Button variant="ghost" size="icon" className="relative shrink-0">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-accent" />
          </Button>
          <Avatar className="h-8 w-8 ring-2 ring-primary/30 shrink-0">
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">NS</AvatarFallback>
          </Avatar>
        </header>
        <main key={pathname} className="flex-1 overflow-y-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
