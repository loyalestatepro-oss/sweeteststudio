import { Link, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu } from "lucide-react";
import { useState } from "react";

const links = [
  { label: "Studios", to: "/#studios" },
  { label: "Templates", to: "/#templates" },
  { label: "Pricing", to: "/pricing" },
  { label: "Docs", to: "/#" },
];

export const SiteNav = () => {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 100], ["hsla(240,18%,4%,0)", "hsla(240,18%,4%,0.7)"]);
  const border = useTransform(scrollY, [0, 100], ["hsla(0,0%,100%,0)", "hsla(0,0%,100%,0.08)"]);
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      style={{ backgroundColor: bg, borderColor: border }}
      className="fixed top-0 inset-x-0 z-50 border-b backdrop-blur-xl"
    >
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className={`text-sm transition-colors ${
                pathname === l.to ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/app" className="text-sm text-muted-foreground hover:text-foreground hidden sm:inline">
            Sign in
          </Link>
          <Button asChild size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90 border-0 shadow-glow">
            <Link to="/app">Launch Studio</Link>
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
                  <Link
                    key={l.label}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 rounded-lg text-base text-muted-foreground hover:bg-muted/40 hover:text-foreground transition"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  to="/app"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-lg text-base text-muted-foreground hover:bg-muted/40 hover:text-foreground transition"
                >
                  Sign in
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
};
