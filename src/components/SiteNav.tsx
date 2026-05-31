import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

const links = [
  { label: "Studios", to: "/#studios" },
  { label: "Templates", to: "/#templates" },
  { label: "Pricing", to: "/pricing" },
  { label: "Docs", to: "/pricing" },
];

export const SiteNav = () => {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 100], ["hsla(240,18%,4%,0)", "hsla(240,18%,4%,0.7)"]);
  const border = useTransform(scrollY, [0, 100], ["hsla(0,0%,100%,0)", "hsla(0,0%,100%,0.08)"]);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLaunch = () => {
    if (user) navigate("/app");
    else navigate("/login");
  };

  const handleLogout = () => {
    logout();
    toast.success("Signed out.");
    navigate("/");
  };

  const handleAnchorLink = (to: string) => {
    if (to.startsWith("/#")) {
      if (pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const id = to.replace("/#", "");
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        const id = to.replace("/#", "");
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(to);
    }
    setOpen(false);
  };

  return (
    <motion.header
      style={{ backgroundColor: bg, borderColor: border }}
      className="fixed top-0 inset-x-0 z-50 border-b backdrop-blur-xl"
    >
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <button
              key={l.label}
              onClick={() => handleAnchorLink(l.to)}
              className={`text-sm transition-colors ${
                pathname === l.to ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Link to="/app" className="text-sm text-muted-foreground hover:text-foreground hidden sm:inline">
                Dashboard
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex text-muted-foreground"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-1.5" /> Sign out
              </Button>
            </>
          ) : (
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground hidden sm:inline">
              Sign in
            </Link>
          )}
          <Button
            size="sm"
            className="bg-gradient-primary text-primary-foreground hover:opacity-90 border-0 shadow-glow"
            onClick={handleLaunch}
          >
            {user ? "Open Studio" : "Launch Studio"}
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background/95 backdrop-blur-xl border-border/60 w-72">
              <div className="mt-8 flex flex-col gap-1">
                {links.map((l) => (
                  <button
                    key={l.label}
                    onClick={() => handleAnchorLink(l.to)}
                    className="px-4 py-3 rounded-lg text-base text-left text-muted-foreground hover:bg-muted/40 hover:text-foreground transition"
                  >
                    {l.label}
                  </button>
                ))}
                {user ? (
                  <>
                    <Link to="/app" onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg text-base text-muted-foreground hover:bg-muted/40 hover:text-foreground transition">
                      Dashboard
                    </Link>
                    <button onClick={handleLogout} className="px-4 py-3 rounded-lg text-base text-left text-muted-foreground hover:bg-muted/40 hover:text-foreground transition">
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg text-base text-muted-foreground hover:bg-muted/40 hover:text-foreground transition">
                      Sign in
                    </Link>
                    <Link to="/signup" onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg text-base text-muted-foreground hover:bg-muted/40 hover:text-foreground transition">
                      Sign up free
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
};
