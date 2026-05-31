import { Logo } from "./Logo";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const groups = [
  { title: "Studios", links: [
    { label: "Video", to: "/app/video" },
    { label: "Image", to: "/app/image" },
    { label: "Music", to: "/app/music" },
    { label: "Voice", to: "/app/voice" },
    { label: "Avatar", to: "/app/avatar" },
  ]},
  { title: "Product", links: [
    { label: "Templates", to: "/app/templates" },
    { label: "Projects", to: "/app/projects" },
    { label: "Pricing", to: "/pricing" },
    { label: "Changelog", to: null },
  ]},
  { title: "Company", links: [
    { label: "About", to: null },
    { label: "Careers", to: null },
    { label: "Blog", to: null },
    { label: "Press", to: null },
  ]},
  { title: "Legal", links: [
    { label: "Privacy", to: null },
    { label: "Terms", to: null },
    { label: "Security", to: null },
    { label: "DPA", to: null },
  ]},
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
              <li key={l.label}>
                {l.to ? (
                  <Link to={l.to} className="hover:text-foreground text-muted-foreground transition">
                    {l.label}
                  </Link>
                ) : (
                  <button
                    className="hover:text-foreground text-muted-foreground transition"
                    onClick={() => toast.info(`${l.label} — coming soon.`)}
                  >
                    {l.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="container py-6 border-t border-border/60 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-muted-foreground">
      <p>© 2026 Sweetest Studio AI. Crafted in the multiverse.</p>
      <p className="font-mono">v1.0 · build 2026</p>
    </div>
  </footer>
);
