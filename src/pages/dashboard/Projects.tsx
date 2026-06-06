import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Plus, Search, Trash2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const INITIAL_PROJECTS = [
  { id: 1, name: "Aurora Campaign", desc: "Q1 hero film + 14 social cuts", updated: "12 min ago", count: 24, gradient: "from-violet-500 to-fuchsia-500" },
  { id: 2, name: "Lumen Cosmetics", desc: "Product launch reels", updated: "1 hour ago", count: 18, gradient: "from-cyan-400 to-blue-500" },
  { id: 3, name: "Polaris Anthem", desc: "Original music + lyric video", updated: "3 hours ago", count: 8, gradient: "from-amber-400 to-pink-500" },
  { id: 4, name: "Globe Dubbing", desc: "12-language brand spot", updated: "Yesterday", count: 36, gradient: "from-emerald-400 to-cyan-500" },
  { id: 5, name: "Vogue Editorial", desc: "Fashion shoot stills", updated: "2 days ago", count: 42, gradient: "from-rose-400 to-violet-500" },
  { id: 6, name: "Helios Sneakers", desc: "Avatar try-on demos", updated: "3 days ago", count: 12, gradient: "from-amber-400 to-orange-500" },
];

const GRADIENTS = [
  "from-violet-500 to-fuchsia-500",
  "from-cyan-400 to-blue-500",
  "from-amber-400 to-pink-500",
  "from-emerald-400 to-cyan-500",
  "from-rose-400 to-violet-500",
];

const Projects = () => {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.desc.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!newName.trim()) { toast.error("Project name is required."); return; }
    const gradient = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];
    setProjects((prev) => [
      {
        id: Date.now(),
        name: newName.trim(),
        desc: newDesc.trim() || "New project",
        updated: "Just now",
        count: 0,
        gradient,
      },
      ...prev,
    ]);
    toast.success(`"${newName.trim()}" created!`);
    setNewName("");
    setNewDesc("");
    setDialogOpen(false);
  };

  const handleDelete = (id: number, name: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast.success(`"${name}" deleted.`);
  };

  const handleDuplicate = (p: typeof INITIAL_PROJECTS[0]) => {
    setProjects((prev) => [
      { ...p, id: Date.now(), name: `${p.name} (copy)`, updated: "Just now" },
      ...prev,
    ]);
    toast.success(`"${p.name}" duplicated.`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">All your creative work in one place.</p>
        </div>
        <Button
          className="bg-gradient-primary text-primary-foreground border-0 shadow-glow w-full sm:w-auto"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" /> New project
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="pl-9 bg-muted/30 border-border/60"
          />
        </div>
        <Button
          variant="outline"
          className="glass border-border/60"
          onClick={() => toast.info("Filter — coming soon.")}
        >
          <Filter className="h-4 w-4 mr-2" /> Filter
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <p className="text-muted-foreground">No projects found.</p>
          <Button className="mt-4 bg-gradient-primary text-primary-foreground border-0" onClick={() => setDialogOpen(true)}>
            Create your first project
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="group glass rounded-2xl overflow-hidden cursor-pointer hover:border-primary/40 transition-all hover:-translate-y-1 relative"
            >
              <div className={`aspect-video bg-gradient-to-br ${p.gradient} relative noise`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute top-3 right-3 text-xs font-mono px-2 py-1 rounded-full glass-strong">{p.count} assets</span>
              </div>
              <div className="p-5 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-medium truncate">{p.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">{p.desc}</p>
                  <p className="text-xs text-muted-foreground mt-3">Updated {p.updated}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border-border/60">
                    <DropdownMenuItem onClick={() => handleDuplicate(p)}>Duplicate</DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(p.id, p.name)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-popover border-border/60">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">New project</DialogTitle>
            <DialogDescription>Set up a new creative project to organize your generations.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs">Project name</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Aurora Campaign"
                className="mt-1.5 bg-muted/30 border-border/60"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
            </div>
            <div>
              <Label className="text-xs">Description <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What's this project about?"
                className="mt-1.5 bg-muted/30 border-border/60"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="glass border-border/60" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-gradient-primary text-primary-foreground border-0" onClick={handleCreate}>
              Create project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;
