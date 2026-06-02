import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Sparkles, Wand2, Download, RefreshCw, Settings2, Upload, Play,
  SlidersHorizontal, History, Trash2, type LucideIcon, Music2, Mic2, Pause,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useGenerationStore, getImageForStudio, type StudioType, type GeneratedItem } from "@/store/useGenerationStore";
import { supabase } from "@/integrations/supabase/client";

interface StudioShellProps {
  title: string;
  subtitle: string;
  accent: string;
  icon: LucideIcon;
  promptPlaceholder: string;
  models: string[];
  presets: string[];
  studioType: StudioType;
  defaultResults: { gradient: string; meta: string }[];
  creditCost?: number;
}

const ENHANCE_SUFFIXES = [
  ", cinematic lighting, 8K ultra-detailed, award-winning",
  ", dramatic composition, volumetric fog, film grain, professional grade",
  ", rich textures, editorial quality, expert craftsmanship",
  ", stunning visual design, masterful technique, premium finish",
];

// Generate realistic metadata per studio type
function generateMeta(studio: StudioType, preset: string): string {
  const now = new Date();
  const ts = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  switch (studio) {
    case "video": {
      const durations = ["6s", "8s", "10s", "12s"];
      const aspects = ["16:9", "9:16", "21:9", "4:3"];
      const resolutions = ["1080p", "4K", "1080p", "4K"];
      const i = Math.floor(Math.random() * 4);
      return `${durations[i]} · ${aspects[i]} · ${resolutions[i]} · ${ts}`;
    }
    case "image": {
      const sizes = ["1024×1024", "1536×1024", "1024×1536", "2048×2048"];
      return `${sizes[Math.floor(Math.random() * sizes.length)]} · ${preset} · ${ts}`;
    }
    case "music": {
      const mins = Math.floor(Math.random() * 3) + 1;
      const secs = Math.floor(Math.random() * 59).toString().padStart(2, "0");
      const bpm = [80, 90, 100, 110, 120, 124, 128, 140][Math.floor(Math.random() * 8)];
      return `${mins}:${secs} · ${bpm} BPM · ${preset}`;
    }
    case "voice": {
      const langs = ["EN", "ES", "FR", "DE", "JP", "PT", "IT"];
      const secs = Math.floor(Math.random() * 55) + 10;
      const m = Math.floor(secs / 60);
      const s = (secs % 60).toString().padStart(2, "0");
      return `${langs[Math.floor(Math.random() * langs.length)]} · ${m}:${s} · ${preset}`;
    }
    case "avatar": {
      const names = ["Sophia", "Marcus", "Aiko", "Diego", "Luna", "Noah"];
      const langs = ["EN", "ES", "FR", "JP"];
      return `${names[Math.floor(Math.random() * names.length)]} · ${langs[Math.floor(Math.random() * langs.length)]} · ${ts}`;
    }
  }
}

// Generate gradient for non-image outputs
function generateGradient(index: number): string {
  const combos = [
    "linear-gradient(135deg, hsl(270 90% 55%), hsl(320 90% 60%))",
    "linear-gradient(135deg, hsl(200 90% 55%), hsl(170 90% 50%))",
    "linear-gradient(135deg, hsl(38 92% 60%), hsl(0 80% 60%))",
    "linear-gradient(135deg, hsl(150 70% 50%), hsl(190 95% 55%))",
    "linear-gradient(135deg, hsl(280 80% 60%), hsl(200 90% 55%))",
    "linear-gradient(135deg, hsl(330 80% 60%), hsl(280 80% 60%))",
    "linear-gradient(135deg, hsl(20 80% 55%), hsl(340 70% 55%))",
    "linear-gradient(135deg, hsl(160 70% 50%), hsl(190 95% 55%))",
  ];
  return combos[index % combos.length];
}

// Audio waveform visual for music/voice
const WaveformVisual = ({ playing, accent }: { playing: boolean; accent: string }) => (
  <div className="absolute inset-0 flex items-center justify-center gap-[3px] px-6">
    {Array.from({ length: 32 }).map((_, i) => (
      <div
        key={i}
        className={`rounded-full bg-gradient-to-t ${accent} opacity-80`}
        style={{
          width: 3,
          height: playing
            ? `${20 + Math.sin(i * 0.4) * 15 + Math.random() * 20}%`
            : `${15 + Math.sin(i * 0.6) * 25}%`,
          transition: playing ? `height ${0.1 + (i % 5) * 0.05}s ease-in-out` : undefined,
          animationName: playing ? "wave" : undefined,
          animationDuration: `${0.4 + (i % 7) * 0.1}s`,
          animationTimingFunction: "ease-in-out",
          animationIterationCount: "infinite",
          animationDirection: "alternate",
        }}
      />
    ))}
  </div>
);

// Result card renders appropriate UI per studio type
const ResultCard = ({
  item,
  studio,
  accent,
  index,
  onDelete,
}: {
  item: GeneratedItem;
  studio: StudioType;
  accent: string;
  index: number;
  onDelete: (id: string) => void;
}) => {
  const [playing, setPlaying] = useState(false);
  const isAudio = studio === "music" || studio === "voice";

  const handlePlay = () => {
    setPlaying((v) => !v);
    toast.info(playing ? "Paused." : `Playing ${studio === "music" ? "track" : "voice clip"}…`);
  };

  const handleDownload = async () => {
    if (!item.imageUrl) {
      toast.info("Preview only — generate to download.");
      return;
    }
    try {
      const res = await fetch(item.imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${studio}-${item.id}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Downloaded!", { description: item.meta });
    } catch {
      toast.error("Download failed.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ delay: index * 0.07 }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer"
      style={{ aspectRatio: studio === "avatar" ? "1/1" : "16/9" }}
    >
      {/* Background: real image or gradient */}
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.prompt}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0" style={{ backgroundImage: item.gradient }} />
      )}

      {/* Audio waveform overlay */}
      {isAudio && <WaveformVisual playing={playing} accent={accent} />}

      {/* Noise texture */}
      <div className="absolute inset-0 noise opacity-30" />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200" />

      {/* Controls on hover */}
      <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
        {isAudio ? (
          <button
            className="h-12 w-12 rounded-full glass-strong flex items-center justify-center hover:scale-110 transition"
            onClick={handlePlay}
          >
            {playing
              ? <Pause className="h-5 w-5" />
              : <Play className="h-5 w-5 ml-0.5" />
            }
          </button>
        ) : (
          <button
            className="h-12 w-12 rounded-full glass-strong flex items-center justify-center hover:scale-110 transition"
            onClick={() => toast.info("Opening preview…")}
          >
            <Play className="h-5 w-5 ml-0.5" />
          </button>
        )}
        <button
          className="h-10 w-10 rounded-full glass-strong flex items-center justify-center hover:scale-110 transition"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          className="h-10 w-10 rounded-full glass-strong flex items-center justify-center hover:scale-110 transition text-destructive/80 hover:text-destructive"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Meta info */}
      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between opacity-0 group-hover:opacity-100 transition">
        <div className="min-w-0 mr-2">
          <p className="text-[11px] text-white/90 font-mono truncate">{item.meta}</p>
          <p className="text-[10px] text-white/60 truncate mt-0.5">{item.prompt.slice(0, 40)}{item.prompt.length > 40 ? "…" : ""}</p>
        </div>
        <span className="px-2 py-0.5 rounded-full glass-strong text-[10px] font-mono shrink-0">v{index + 1}</span>
      </div>

      {/* Playing indicator */}
      {playing && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 glass-strong rounded-full px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-mono">Playing</span>
        </div>
      )}
    </motion.div>
  );
};

// Left controls panel
const Controls = ({
  title, subtitle, accent, icon: Icon, promptPlaceholder, models, presets,
  rendering, onGenerate, prompt, setPrompt, selectedPreset, setSelectedPreset, creditCost, studioType,
}: any) => {
  const [creativity, setCreativity] = useState([70]);
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const user = useAuthStore((s) => s.user);
  const remaining = user ? user.credits.total - user.credits.used : 0;

  const handleEnhance = () => {
    if (!prompt.trim()) { toast.error("Enter a prompt first."); return; }
    const suffix = ENHANCE_SUFFIXES[Math.floor(Math.random() * ENHANCE_SUFFIXES.length)];
    setPrompt(prompt.replace(/,?\s*(cinematic|ultra|film grain|professional|award).*$/i, "") + suffix);
    toast.success("Prompt enhanced!");
  };

  const isAudio = studioType === "music" || studioType === "voice";

  return (
    <div className="p-5 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${accent} flex items-center justify-center`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl leading-none">{title}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-muted-foreground">
          {isAudio ? "Description / Lyrics" : "Prompt"}
        </label>
        <Textarea
          value={prompt}
          onChange={(e: any) => setPrompt(e.target.value)}
          placeholder={promptPlaceholder}
          className="mt-2 min-h-32 bg-muted/30 border-border/60 resize-none"
        />
        <div className="flex gap-2 mt-2">
          <Button variant="outline" size="sm" className="flex-1 glass border-border/60" onClick={handleEnhance}>
            <Wand2 className="h-3.5 w-3.5 mr-1.5" /> Enhance
          </Button>
          {!isAudio && (
            <Button variant="outline" size="sm" className="glass border-border/60" onClick={() => toast.info("Upload reference — coming soon.")}>
              <Upload className="h-3.5 w-3.5" />
            </Button>
          )}
          {isAudio && (
            <Button variant="outline" size="sm" className="glass border-border/60" onClick={() => toast.info("Upload audio sample — coming soon.")}>
              {studioType === "music" ? <Music2 className="h-3.5 w-3.5" /> : <Mic2 className="h-3.5 w-3.5" />}
            </Button>
          )}
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-muted-foreground">Model</label>
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="mt-2 bg-muted/30 border-border/60"><SelectValue /></SelectTrigger>
          <SelectContent>
            {models.map((m: string) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-muted-foreground">Style preset</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {presets.map((p: string) => (
            <button
              key={p}
              onClick={() => setSelectedPreset(p)}
              className={`text-xs px-3 py-2 rounded-lg border transition ${
                selectedPreset === p
                  ? "border-primary/60 bg-primary/10 text-foreground"
                  : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Creativity</label>
          <span className="text-xs font-mono">{(creativity[0] / 100).toFixed(2)}</span>
        </div>
        <Slider value={creativity} onValueChange={setCreativity} max={100} />
      </div>

      <div className="glass rounded-lg px-3 py-2.5 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Credits remaining</span>
        <span className={`font-mono ${remaining < 50 ? "text-destructive" : "text-foreground"}`}>
          {remaining.toLocaleString()}
        </span>
      </div>

      <Button
        onClick={() => onGenerate(selectedModel, creativity[0])}
        disabled={rendering || remaining < creditCost}
        className={`w-full bg-gradient-to-r ${accent} text-white border-0 shadow-glow h-11 disabled:opacity-50`}
      >
        {rendering ? (
          <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Generating…</>
        ) : remaining < creditCost ? (
          "Not enough credits"
        ) : (
          <><Sparkles className="h-4 w-4 mr-2" /> Generate · {creditCost} credits</>
        )}
      </Button>
    </div>
  );
};

// Right history panel
const HistoryPanel = ({ studioType, accent }: { studioType: StudioType; accent: string }) => {
  const items = useGenerationStore((s) => s.items.filter((i) => i.studio === studioType));
  const deleteItem = useGenerationStore((s) => s.deleteItem);
  const isAudio = studioType === "music" || studioType === "voice";

  return (
    <div className="p-5 sm:p-6">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
        History ({items.length})
      </p>
      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xs text-muted-foreground">No renders yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Generate something to see it here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 group">
              <div
                className="h-14 w-20 rounded-lg flex-shrink-0 overflow-hidden relative"
                style={{ backgroundImage: item.gradient }}
              >
                {item.imageUrl && (
                  <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                )}
                {isAudio && (
                  <div className="absolute inset-0 flex items-center justify-center gap-0.5">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className={`w-0.5 rounded-full bg-gradient-to-t ${accent}`}
                        style={{ height: `${30 + Math.sin(i) * 20}%` }} />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{item.prompt.slice(0, 30)}…</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.meta}</p>
                <div className="flex gap-2 mt-1">
                  <button className="text-[10px] text-primary-glow hover:underline"
                    onClick={() => toast.success("Downloaded!")}>Download</button>
                  <button className="text-[10px] text-muted-foreground hover:text-destructive transition"
                    onClick={() => deleteItem(item.id)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const StudioShell = (props: StudioShellProps) => {
  const { title, accent, icon: Icon, studioType, defaultResults, presets, creditCost = 12 } = props;
  const [prompt, setPrompt] = useState("");
  const [rendering, setRendering] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(presets[0]);

  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const { items: allItems, addItems, deleteItem } = useGenerationStore();
  const studioItems = allItems.filter((i) => i.studio === studioType);

  // Show generated items or fall back to defaults
  const displayItems: GeneratedItem[] = studioItems.length > 0
    ? studioItems.slice(0, 4)
    : defaultResults.map((r, i) => ({
        id: `default_${studioType}_${i}`,
        studio: studioType,
        prompt: "Sample output",
        preset: presets[0],
        model: props.models[0],
        meta: r.meta,
        createdAt: Date.now(),
        gradient: r.gradient,
        imageUrl: undefined,
      }));

  const handleGenerate = async (model: string, _creativity: number) => {
    if (!prompt.trim()) {
      toast.error("Enter a prompt before generating.", { description: "Describe what you want to create." });
      return;
    }
    if (!user) return;
    if (user.credits.used + creditCost > user.credits.total) {
      toast.error("Not enough credits.", { description: "Upgrade your plan to get more." });
      return;
    }

    setRendering(true);
    const toastId = toast.loading(`Generating ${studioType}…`, { description: "This takes a moment." });
    const useRealAI = studioType === "image" || studioType === "avatar";
    const count = 4;

    try {
      let imageUrls: (string | undefined)[] = [];

      if (useRealAI) {
        const aspectRatio = studioType === "avatar" ? "1:1" : "16:9";
        const { data, error } = await supabase.functions.invoke("generate-image", {
          body: { prompt, count, aspectRatio },
        });
        if (error) throw new Error(error.message || "Generation failed");
        if (!data?.images?.length) throw new Error("No images returned");
        imageUrls = data.images;
      } else {
        // Simulated delay for non-image studios (video/music/voice previews)
        await new Promise((r) => setTimeout(r, 2200 + Math.random() * 600));
        imageUrls = Array.from({ length: count }).map((_, i) =>
          getImageForStudio(studioType, i + Math.floor(Math.random() * 100))
        );
      }

      const newItems: GeneratedItem[] = imageUrls.map((url, i) => ({
        id: `gen_${Date.now()}_${i}`,
        studio: studioType,
        prompt,
        preset: selectedPreset,
        model,
        meta: generateMeta(studioType, selectedPreset),
        createdAt: Date.now(),
        gradient: generateGradient(Math.floor(Math.random() * 8)),
        imageUrl: url,
      }));

      addItems(newItems);
      updateUser({ credits: { ...user.credits, used: user.credits.used + creditCost } });

      toast.dismiss(toastId);
      toast.success("Generation complete! ✨", {
        description: `${newItems.length} outputs ready · ${creditCost} credits used`,
      });
    } catch (err: any) {
      toast.dismiss(toastId);
      const msg = String(err?.message || err);
      if (msg.includes("429")) {
        toast.error("Rate limit reached.", { description: "Please wait a moment and try again." });
      } else if (msg.includes("402")) {
        toast.error("AI credits exhausted.", { description: "Add credits in workspace settings." });
      } else {
        toast.error("Generation failed.", { description: msg.slice(0, 140) });
      }
    } finally {
      setRendering(false);
    }
  };

  const ctrl = { ...props, prompt, setPrompt, rendering, onGenerate: handleGenerate, selectedPreset, setSelectedPreset, creditCost };

  return (
    <div className="lg:grid lg:grid-cols-[320px_1fr_300px] min-h-[calc(100vh-4rem)]">
      {/* Mobile toolbar */}
      <div className="lg:hidden flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 sticky top-16 bg-background/90 backdrop-blur-xl z-20">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${accent} flex items-center justify-center shrink-0`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-lg truncate">{title}</span>
        </div>
        <div className="flex gap-2 shrink-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="glass border-border/60"><SlidersHorizontal className="h-4 w-4" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[88vw] sm:w-96 bg-background border-border/60 overflow-y-auto">
              <Controls {...ctrl} />
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="glass border-border/60"><History className="h-4 w-4" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-[88vw] sm:w-80 bg-background border-border/60 overflow-y-auto">
              <HistoryPanel studioType={studioType} accent={accent} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Left controls (desktop) */}
      <aside className="hidden lg:block border-r border-border/60 overflow-y-auto">
        <Controls {...ctrl} />
      </aside>

      {/* Center canvas */}
      <section className="p-4 sm:p-6 lg:p-8 overflow-y-auto bg-nebula relative">
        <div className="absolute inset-0 grid-bg opacity-10" />
        <div className="relative">
          <Tabs defaultValue="grid" className="mb-6">
            <div className="flex items-center justify-between gap-2">
              <TabsList className="glass">
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="canvas">Canvas</TabsTrigger>
                <TabsTrigger value="timeline" className="hidden sm:inline-flex">Timeline</TabsTrigger>
              </TabsList>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => toast.info("Export settings — coming soon.")}>
                  <Settings2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => toast.success("All outputs saved to downloads!")}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Tabs>

          <AnimatePresence mode="wait">
            {rendering ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`grid gap-3 sm:gap-4 ${studioType === "avatar" ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-muted/40 flex items-center justify-center overflow-hidden"
                    style={{ aspectRatio: studioType === "avatar" ? "1/1" : "16/9" }}
                  >
                    <div className="text-center space-y-3">
                      <div className="relative mx-auto h-10 w-10">
                        <RefreshCw className="h-10 w-10 text-primary/30 animate-spin absolute" />
                        <Sparkles className="h-5 w-5 text-primary-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">Rendering {i + 1}/4…</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="results"
                className={`grid gap-3 sm:gap-4 ${studioType === "avatar" ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}
              >
                {displayItems.map((item, i) => (
                  <ResultCard
                    key={item.id}
                    item={item}
                    studio={studioType}
                    accent={accent}
                    index={i}
                    onDelete={(id) => {
                      deleteItem(id);
                      toast.success("Output removed.");
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {studioItems.length > 0 && (
            <p className="text-center text-xs text-muted-foreground mt-6">
              Showing {Math.min(studioItems.length, 4)} of {studioItems.length} generation{studioItems.length > 1 ? "s" : ""}
              {studioItems.length > 4 && (
                <> · <button className="text-primary-glow hover:underline" onClick={() => toast.info("Full history in the panel →")}>View all</button></>
              )}
            </p>
          )}
        </div>
      </section>

      {/* Right history (desktop) */}
      <aside className="hidden lg:block border-l border-border/60 overflow-y-auto">
        <HistoryPanel studioType={studioType} accent={accent} />
      </aside>
    </div>
  );
};
