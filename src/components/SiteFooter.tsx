import { Logo } from "./Logo";
import { Link } from "react-router-dom";

const groups = [
  { title: "Studios", links: ["Video", "Image", "Music", "Voice", "Avatar"] },
  { title: "Product", links: ["Templates", "Projects", "Pricing", "Changelog"] },
  { title: "Company", links: ["About", "Careers", "Blog", "Press"] },
  { title: "Legal", links: ["Privacy", "Terms", "Security", "DPA"] },
];

export const SiteFooter = () => (
  <footer className="relative border-t border-border/60 mt-32">
    <div className="container py-16 grid gap-12 md:grid-cols-6">
      <div className="md:col-span-2 space-y-4">
        <Logo />
        <p className="text-sm text-muted-foreground max-w-xs">
          The creative operating system for AI-native studios. Built for creators who refuse to compromise.
        </p>
      </div>
      {groups.map((g) => (
        <div key={g.title}>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">{g.title}</p>
          <ul className="space-y-2 text-sm">
            {g.links.map((l) => (
              <li key={l}><Link to="#" className="hover:text-foreground text-muted-foreground transition">{l}</Link></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="container py-6 border-t border-border/60 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-muted-foreground">
      <p>© 2026 Nebula Studio AI. Crafted in the multiverse.</p>
      <p className="font-mono">v1.0 · build {Math.floor(Math.random() * 9000 + 1000)}</p>
    </div>
  </footer>
);
