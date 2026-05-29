import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Wand2, Download, RefreshCw, Settings2, Upload, Play, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StudioShellProps {
  title: string;
  subtitle: string;
  accent: string; // gradient classes
  icon: LucideIcon;
  promptPlaceholder: string;
  models: string[];
  presets: string[];
  results: { gradient: string; meta: string }[];
}

export const StudioShell = ({ title, subtitle, accent, icon: Icon, promptPlaceholder, models, presets, results }: StudioShellProps) => {
  const [prompt, setPrompt] = useState("");
  const [rendering, setRendering] = useState(false);

  return (
    <div className="grid lg:grid-cols-[320px_1fr_320px] min-h-[calc(100vh-4rem)]">
      {/* Left: prompt + controls */}
      <aside className="border-r border-border/60 p-6 space-y-6 overflow-y-auto">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${accent} flex items-center justify-center`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl leading-none">{title}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Prompt</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={promptPlaceholder}
            className="mt-2 min-h-32 bg-muted/30 border-border/60 resize-none"
          />
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" className="flex-1 glass border-border/60">
              <Wand2 className="h-3.5 w-3.5 mr-1.5" /> Enhance
            </Button>
            <Button variant="outline" size="sm" className="glass border-border/60">
              <Upload className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Model</label>
          <Select defaultValue={models[0]}>
            <SelectTrigger className="mt-2 bg-muted/30 border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Style preset</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {presets.map((p, i) => (
              <button key={p} className={`text-xs px-3 py-2 rounded-lg border transition ${i === 0 ? "border-primary/50 bg-primary/10 text-foreground" : "border-border/60 text-muted-foreground hover:border-border"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Creativity</label>
            <span className="text-xs font-mono">0.7</span>
          </div>
          <Slider defaultValue={[70]} max={100} className="" />
        </div>

        <Button
          onClick={() => { setRendering(true); setTimeout(() => setRendering(false), 2200); }}
          disabled={rendering}
          className={`w-full bg-gradient-to-r ${accent} text-white border-0 shadow-glow h-11`}
        >
          {rendering ? (
            <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Rendering…</>
          ) : (
            <><Sparkles className="h-4 w-4 mr-2" /> Generate · 12 credits</>
          )}
        </Button>
      </aside>

      {/* Center: canvas */}
      <section className="p-8 overflow-y-auto bg-nebula relative">
        <div className="absolute inset-0 grid-bg opacity-10" />
        <div className="relative">
          <Tabs defaultValue="grid" className="mb-6">
            <div className="flex items-center justify-between">
              <TabsList className="glass">
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="canvas">Canvas</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm"><Settings2 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
              </div>
            </div>
          </Tabs>

          <div className="grid sm:grid-cols-2 gap-4">
            {results.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="group relative aspect-video rounded-2xl overflow-hidden cursor-pointer"
                style={{ backgroundImage: r.gradient }}
              >
                <div className="absolute inset-0 noise opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <div className="h-14 w-14 rounded-full glass-strong flex items-center justify-center">
                    <Play className="h-5 w-5 ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90 font-mono opacity-0 group-hover:opacity-100 transition">
                  <span>{r.meta}</span>
                  <span className="px-2 py-0.5 rounded-full glass-strong">v{i + 1}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Right: history */}
      <aside className="border-l border-border/60 p-6 overflow-y-auto">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Render history</p>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3 group cursor-pointer">
              <div
                className="h-14 w-20 rounded-lg flex-shrink-0"
                style={{ background: `linear-gradient(${130 + i * 30}deg, hsl(${260 + i * 25} 80% 55%), hsl(${190 + i * 15} 90% 50%))` }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">Render #{840 - i}</p>
                <p className="text-[10px] text-muted-foreground">{i === 0 ? "Just now" : `${i * 12} min ago`}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};
