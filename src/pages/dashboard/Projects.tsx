import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Plus, Search } from "lucide-react";

const projects = [
  { name: "Aurora Campaign", desc: "Q1 hero film + 14 social cuts", updated: "12 min ago", count: 24, gradient: "from-violet-500 to-fuchsia-500" },
  { name: "Lumen Cosmetics", desc: "Product launch reels", updated: "1 hour ago", count: 18, gradient: "from-cyan-400 to-blue-500" },
  { name: "Polaris Anthem", desc: "Original music + lyric video", updated: "3 hours ago", count: 8, gradient: "from-amber-400 to-pink-500" },
  { name: "Globe Dubbing", desc: "12-language brand spot", updated: "Yesterday", count: 36, gradient: "from-emerald-400 to-cyan-500" },
  { name: "Vogue Editorial", desc: "Fashion shoot stills", updated: "2 days ago", count: 42, gradient: "from-rose-400 to-violet-500" },
  { name: "Helios Sneakers", desc: "Avatar try-on demos", updated: "3 days ago", count: 12, gradient: "from-gold to-amber-400" },
];

const Projects = () => (
  <div className="p-4 sm:p-6 lg:p-8 max-w-7xl space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">Projects</h1>
        <p className="text-sm text-muted-foreground mt-1">All your creative work in one place.</p>
      </div>
      <Button className="bg-gradient-primary text-primary-foreground border-0 shadow-glow w-full sm:w-auto">
        <Plus className="h-4 w-4 mr-2" /> New project
      </Button>
    </div>

    <div className="flex gap-3">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search projects…" className="pl-9 bg-muted/30 border-border/60" />
      </div>
      <Button variant="outline" className="glass border-border/60"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((p) => (
        <div key={p.name} className="group glass rounded-2xl overflow-hidden cursor-pointer hover:border-primary/40 transition-all hover:-translate-y-1">
          <div className={`aspect-video bg-gradient-to-br ${p.gradient} relative noise`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute top-3 right-3 text-xs font-mono px-2 py-1 rounded-full glass-strong">{p.count} assets</span>
          </div>
          <div className="p-5">
            <h3 className="font-medium">{p.name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{p.desc}</p>
            <p className="text-xs text-muted-foreground mt-3">Updated {p.updated}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Projects;
