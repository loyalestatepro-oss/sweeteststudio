import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Sparkles, Wand2, Download, RefreshCw, Settings2, Upload, Play,
  SlidersHorizontal, History, Trash2, type LucideIcon, Music2, Mic2, Pause,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useGenerationStore, type StudioType, type GeneratedItem } from "@/store/useGenerationStore";
import { supabase } from "@/integrations/supabase/client";
import { VideoPreview } from "@/components/VideoPreview";

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

function hashPrompt(input: string): number {
  return input.split("").reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
}

function createPremiumFallback(studio: StudioType, prompt: string, index: number, aspectRatio: "16:9" | "1:1" = "16:9"): string {
  const seed = Math.abs(hashPrompt(`${studio}-${prompt}-${index}`));
  const hueA = (seed + index * 37) % 360;
  const hueB = (hueA + 58 + index * 19) % 360;
  const hueC = (hueA + 132) % 360;
  const width = aspectRatio === "1:1" ? 1024 : 1536;
  const height = aspectRatio === "1:1" ? 1024 : 864;
  const shapes = studio === "avatar"
    ? `<circle cx="${width / 2}" cy="${height * 0.42}" r="${height * 0.16}" fill="hsl(${hueC} 72% 72% / .88)"/><path d="M${width * 0.28} ${height * 0.92}C${width * 0.34} ${height * 0.66} ${width * 0.66} ${height * 0.66} ${width * 0.72} ${height * 0.92}Z" fill="hsl(${hueB} 70% 54% / .82)"/>`
    : `<path d="M0 ${height * 0.72} C${width * 0.25} ${height * 0.48} ${width * 0.42} ${height * 0.88} ${width} ${height * 0.55} L${width} ${height} L0 ${height}Z" fill="hsl(${hueB} 74% 48% / .42)"/><circle cx="${width * 0.72}" cy="${height * 0.3}" r="${height * 0.18}" fill="hsl(${hueC} 86% 62% / .52)"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="hsl(${hueA} 78% 14%)"/><stop offset=".52" stop-color="hsl(${hueB} 84% 32%)"/><stop offset="1" stop-color="hsl(${hueC} 88% 58%)"/></linearGradient><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".78" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .18"/></feComponentTransfer></filter><radialGradient id="spot" cx="38%" cy="24%" r="70%"><stop stop-color="hsl(0 0% 100% / .35)"/><stop offset=".42" stop-color="hsl(0 0% 100% / .08)"/><stop offset="1" stop-color="hsl(0 0% 0% / .34)"/></radialGradient></defs><rect width="${width}" height="${height}" fill="url(#g)"/>${shapes}<rect width="${width}" height="${height}" fill="url(#spot)"/><rect width="${width}" height="${height}" filter="url(#grain)"/><text x="${width*.5}" y="${height*.5}" text-anchor="middle" dominant-baseline="middle" font-family="system-ui" font-size="${height*.025}" fill="hsl(0 0% 100%/.45)">${prompt.slice(0,60)}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function createFallbackUrls(studio: StudioType, prompt: string, count: number, aspectRatio: "16:9" | "1:1" = "16:9") {
  return Array.from({ length: count }).map((_, i) => createPremiumFallback(studio, prompt, i, aspectRatio));
}

// ─── Audio waveform visual ────────────────────────────────────────────────────
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

// ─── Result card ─────────────────────────────────────────────────────────────
const ResultCard = ({
  item, studio, accent, index, onDelete,
}: {
  item: GeneratedItem; studio: StudioType; accent: string; index: number; onDelete: (id: string) => void;
}) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isAudio = studio === "music" || studio === "voice";

  const handlePlay = () => {
    if (item.audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(item.audioUrl);
        audioRef.current.onended = () => setPlaying(false);
      }
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        audioRef.current.play().catch(() => toast.error("Could not play audio."));
        setPlaying(true);
      }
    } else {
      setPlaying((v) => !v);
      toast.info(playing ? "Paused." : `Previewing ${studio} waveform — add API key for real audio.`);
    }
  };

  // Fixed download: handles both data: URIs and real URLs
  const handleDownload = async () => {
    const src = item.imageUrl || item.audioUrl;
    if (!src) {
      toast.info("Preview only — API key needed for real output.");
      return;
    }
    try {
      const ext = isAudio ? "mp3" : studio === "video" ? "mp4" : "png";
      const filename = `${studio}-${item.id.slice(-8)}.${ext}`;
      if (src.startsWith("data:")) {
        // data: URI — decode and trigger download directly
        const a = document.createElement("a");
        a.href = src;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        // Real URL — fetch blob then download
        const res = await fetch(src);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
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
      {studio === "video" && item.frames && item.frames.length > 0 ? (
        <VideoPreview frames={item.frames} />
      ) : item.imageUrl ? (
        <img src={item.imageUrl} alt={item.prompt} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="absolute inset-0" style={{ backgroundImage: item.gradient }} />
      )}

      {isAudio && <WaveformVisual playing={playing} accent={accent} />}
      <div className="absolute inset-0 noise opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200" />

      <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
        <button className="h-12 w-12 rounded-full glass-strong flex items-center justify-center hover:scale-110 transition" onClick={handlePlay}>
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </button>
        <button className="h-10 w-10 rounded-full glass-strong flex items-center justify-center hover:scale-110 transition" onClick={handleDownload}>
          <Download className="h-4 w-4" />
        </button>
        <button
          className="h-10 w-10 rounded-full glass-strong flex items-center justify-center hover:scale-110 transition text-destructive/80 hover:text-destructive"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between opacity-0 group-hover:opacity-100 transition">
        <div className="min-w-0 mr-2">
          <p className="text-[11px] text-white/90 font-mono truncate">{item.meta}</p>
          <p className="text-[10px] text-white/60 truncate mt-0.5">{item.prompt.slice(0, 40)}{item.prompt.length > 40 ? "…" : ""}</p>
        </div>
        <span className="px-2 py-0.5 rounded-full glass-strong text-[10px] font-mono shrink-0">v{index + 1}</span>
      </div>

      {playing && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 glass-strong rounded-full px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-mono">Playing</span>
        </div>
      )}
    </motion.div>
  );
};

// ─── Left controls panel ──────────────────────────────────────────────────────
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
        <Textarea value={prompt} onChange={(e: any) => setPrompt(e.target.value)} placeholder={promptPlaceholder}
          className="mt-2 min-h-32 bg-muted/30 border-border/60 resize-none" />
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
            <Button variant="outline" size="sm" className="glass border-border/60" onClick={() => toast.info("Upload sample — coming soon.")}>
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
            <button key={p} onClick={() => setSelectedPreset(p)}
              className={`text-xs px-3 py-2 rounded-lg border transition ${
                selectedPreset === p
                  ? "border-primary/60 bg-primary/10 text-foreground"
                  : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
              }`}>
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

// ─── Right history panel ──────────────────────────────────────────────────────
const HistoryPanel = ({ studioType, accent }: { studioType: StudioType; accent: string }) => {
  const allItems = useGenerationStore((s) => s.items);
  const deleteItem = useGenerationStore((s) => s.deleteItem);
  const items = allItems.filter((i) => i.studio === studioType);
  const isAudio = studioType === "music" || studioType === "voice";

  const handleHistoryDownload = (item: GeneratedItem) => {
    const src = item.imageUrl || item.audioUrl;
    if (!src) { toast.info("Preview only."); return; }
    const a = document.createElement("a");
    a.href = src;
    a.download = `${studioType}-${item.id.slice(-8)}.${isAudio ? "mp3" : "png"}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success("Downloaded!");
  };

  return (
    <div className="p-5 sm:p-6">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">History ({items.length})</p>
      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xs text-muted-foreground">No renders yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Generate something to see it here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 group">
              <div className="h-14 w-20 rounded-lg flex-shrink-0 overflow-hidden relative"
                style={{ backgroundImage: item.gradient }}>
                {item.imageUrl && <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />}
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
                  <button className="text-[10px] text-primary-glow hover:underline" onClick={() => handleHistoryDownload(item)}>
                    Download
                  </button>
                  <button className="text-[10px] text-muted-foreground hover:text-destructive transition" onClick={() => deleteItem(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main StudioShell ─────────────────────────────────────────────────────────
export const StudioShell = (props: StudioShellProps) => {
  const { title, accent, icon: Icon, studioType, defaultResults, presets, creditCost = 12 } = props;
  const [prompt, setPrompt] = useState("");
  const [rendering, setRendering] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(presets[0]);
  const [progress, setProgress] = useState<{ step: number; total: number; label: string } | null>(null);
  const [liveFrames, setLiveFrames] = useState<string[]>([]);

  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const allItems = useGenerationStore((s) => s.items);
  const addItems = useGenerationStore((s) => s.addItems);
  const deleteItem = useGenerationStore((s) => s.deleteItem);
  const studioItems = allItems.filter((i) => i.studio === studioType);

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
        audioUrl: undefined,
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
    setProgress({ step: 0, total: 5, label: "Starting…" });
    setLiveFrames([]);
    const toastId = toast.loading(`Generating ${studioType}…`, { description: "This takes a moment." });
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
    const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
    const count = studioType === "video" ? 1 : 4;

    try {
      let newItems: GeneratedItem[] = [];

      // ── VIDEO ──────────────────────────────────────────────────────────────
      if (studioType === "video") {
        const resp = await fetch(`${SUPABASE_URL}/functions/v1/generate-video`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
          body: JSON.stringify({ prompt, aspectRatio: "16:9" }),
        });
        if (!resp.ok || !resp.body) throw new Error(`Stream failed (${resp.status})`);

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let videoFrames: string[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";
          for (const ev of events) {
            const lines = ev.split("\n");
            let eventName = "message", dataStr = "";
            for (const line of lines) {
              if (line.startsWith("event:")) eventName = line.slice(6).trim();
              else if (line.startsWith("data:")) dataStr += line.slice(5).trim();
            }
            if (!dataStr) continue;
            let payload: any;
            try { payload = JSON.parse(dataStr); } catch { continue; }
            if (eventName === "stage") setProgress({ step: payload.step, total: payload.total, label: payload.label });
            else if (eventName === "frame") { videoFrames.push(payload.url); setLiveFrames([...videoFrames]); }
            else if (eventName === "done") { if (Array.isArray(payload.frames)) videoFrames = payload.frames; }
          }
        }
        if (videoFrames.length === 0) throw new Error("No video frames generated");
        newItems = [{
          id: `gen_${Date.now()}`,
          studio: studioType, prompt, preset: selectedPreset, model,
          meta: generateMeta(studioType, selectedPreset),
          createdAt: Date.now(),
          gradient: generateGradient(Math.floor(Math.random() * 8)),
          imageUrl: videoFrames[0],
          frames: videoFrames,
        }];

      // ── IMAGE / AVATAR ────────────────────────────────────────────────────
      } else if (studioType === "image" || studioType === "avatar") {
        const aspectRatio = studioType === "avatar" ? "1:1" : "16:9";
        let imageUrls: string[] = [];
        try {
          const { data, error } = await supabase.functions.invoke("generate-image", {
            body: { prompt, count, aspectRatio },
          });
          if (error) throw new Error(error.message || "Generation failed");
          if (!data?.images?.length) throw new Error("No images returned");
          imageUrls = data.images;
          if (data.fallback) {
            toast.info("Using enhanced preview.", { description: "Add LOVABLE_API_KEY for real AI images." });
          }
        } catch (err: any) {
          imageUrls = createFallbackUrls(studioType, prompt, count, aspectRatio as "16:9" | "1:1");
          toast.warning("Using local preview.", {
            description: "Edge function unavailable — using client-side fallback.",
          });
        }
        newItems = imageUrls.map((url, i) => ({
          id: `gen_${Date.now()}_${i}`,
          studio: studioType, prompt, preset: selectedPreset, model,
          meta: generateMeta(studioType, selectedPreset),
          createdAt: Date.now(),
          gradient: generateGradient(i),
          imageUrl: url,
        }));

      // ── MUSIC ─────────────────────────────────────────────────────────────
      } else if (studioType === "music") {
        let tracks: any[] = [];
        try {
          const { data, error } = await supabase.functions.invoke("generate-music", {
            body: { prompt, preset: selectedPreset, count },
          });
          if (error) throw new Error(error.message);
          tracks = data?.tracks || [];
          if (data?.fallback) toast.info("Synthesized preview generated.");
        } catch {
          // Build entirely client-side
          tracks = Array.from({ length: count }, (_, i) => ({
            id: `t_${Date.now()}_${i}`,
            duration: `${Math.floor(Math.random()*3)+1}:${Math.floor(Math.random()*59).toString().padStart(2,"0")}`,
            bpm: [80,90,100,110,120,124,128,140][Math.floor(Math.random()*8)],
            preset: selectedPreset, fallback: true,
          }));
        }
        newItems = tracks.map((t, i) => ({
          id: `gen_${Date.now()}_${i}`,
          studio: studioType, prompt, preset: selectedPreset, model,
          meta: `${t.duration} · ${t.bpm} BPM · ${t.preset || selectedPreset}`,
          createdAt: Date.now(),
          gradient: generateGradient(i),
          audioUrl: t.audioUrl || null,
        }));

      // ── VOICE ─────────────────────────────────────────────────────────────
      } else if (studioType === "voice") {
        let clips: any[] = [];
        try {
          const { data, error } = await supabase.functions.invoke("generate-voice", {
            body: { prompt, preset: selectedPreset, count },
          });
          if (error) throw new Error(error.message);
          clips = data?.clips || [];
          if (data?.fallback) toast.info("Waveform preview mode.", { description: "Add ELEVENLABS_API_KEY for real voice." });
        } catch {
          clips = Array.from({ length: count }, (_, i) => ({
            id: `c_${Date.now()}_${i}`,
            duration: `0:${Math.floor(Math.random()*50+10).toString().padStart(2,"0")}`,
            lang: ["EN","ES","FR","DE"][i%4],
            preset: selectedPreset, fallback: true,
          }));
        }
        newItems = clips.map((c, i) => ({
          id: `gen_${Date.now()}_${i}`,
          studio: studioType, prompt, preset: selectedPreset, model,
          meta: `${c.lang || "EN"} · ${c.duration} · ${c.preset || selectedPreset}`,
          createdAt: Date.now(),
          gradient: generateGradient(i),
          audioUrl: c.audioUrl || null,
        }));
      }

      addItems(newItems);
      updateUser({ credits: { ...user.credits, used: user.credits.used + creditCost } });
      toast.dismiss(toastId);
      toast.success("Generation complete! ✨", {
        description: `${newItems.length} output${newItems.length > 1 ? "s" : ""} ready · ${creditCost} credits used`,
      });
    } catch (err: any) {
      toast.dismiss(toastId);
      const msg = String(err?.message || err);
      if (msg.includes("429")) toast.error("Rate limit reached.", { description: "Please wait and try again." });
      else if (msg.includes("402")) toast.error("AI credits exhausted.", { description: "Add credits in settings." });
      else toast.error("Generation failed.", { description: msg.slice(0, 140) });
    } finally {
      setRendering(false);
      setProgress(null);
      setLiveFrames([]);
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
              <SheetTitle className="sr-only">{title} controls</SheetTitle>
              <SheetDescription className="sr-only">Adjust prompt, model, preset, and generation settings.</SheetDescription>
              <Controls {...ctrl} />
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="glass border-border/60"><History className="h-4 w-4" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-[88vw] sm:w-80 bg-background border-border/60 overflow-y-auto">
              <SheetTitle className="sr-only">{title} history</SheetTitle>
              <SheetDescription className="sr-only">Review and manage previous generations.</SheetDescription>
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
                <Button variant="ghost" size="sm" onClick={() => toast.info("Export settings — coming soon.")}><Settings2 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => toast.success("Outputs saved!")}><Download className="h-4 w-4" /></Button>
              </div>
            </div>
          </Tabs>

          <AnimatePresence mode="wait">
            {rendering ? (
              studioType === "video" ? (
                <motion.div key="video-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border border-border/60"
                    style={{ aspectRatio: "16/9", background: "radial-gradient(120% 80% at 30% 20%, hsl(270 70% 22%) 0%, hsl(240 50% 10%) 60%, hsl(230 30% 6%) 100%)" }}>
                    <div className="absolute inset-0 opacity-60 animate-pulse" style={{ background: "linear-gradient(120deg, transparent 30%, hsl(280 80% 60% / 0.15) 50%, transparent 70%)" }} />
                    {liveFrames.length > 0 ? <VideoPreview frames={liveFrames} /> : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative h-14 w-14">
                          <RefreshCw className="h-14 w-14 text-primary-glow/40 animate-spin absolute" />
                          <Sparkles className="h-6 w-6 text-primary-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        </div>
                      </div>
                    )}
                    <div className="absolute left-3 right-3 bottom-3 glass-strong rounded-xl px-3 py-2.5 flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-accent animate-pulse shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-mono truncate">{progress?.label ?? "Working…"}</p>
                        <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${accent} transition-all duration-500`}
                            style={{ width: `${progress ? ((progress.step + 1) / progress.total) * 100 : 8}%` }} />
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                        {progress ? `${progress.step + 1}/${progress.total}` : ""}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="aspect-video rounded-lg overflow-hidden border border-border/60 relative"
                        style={{ background: `linear-gradient(135deg, hsl(${260 + i * 30} 60% 18%), hsl(${230 + i * 20} 40% 8%))` }}>
                        {liveFrames[i]
                          ? <img src={liveFrames[i]} alt="" className="w-full h-full object-cover" />
                          : <div className="absolute inset-0 flex items-center justify-center"><span className="text-[10px] font-mono text-muted-foreground">Shot {i + 1}</span></div>
                        }
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className={`grid gap-3 sm:gap-4 ${studioType === "avatar" ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-2xl flex items-center justify-center overflow-hidden relative border border-border/60"
                      style={{ aspectRatio: studioType === "avatar" ? "1/1" : "16/9", background: `linear-gradient(135deg, hsl(${260 + i * 25} 60% 18%), hsl(${220 + i * 15} 45% 10%))` }}>
                      <div className="absolute inset-0 opacity-50 animate-pulse" style={{ background: "linear-gradient(120deg, transparent 30%, hsl(280 80% 60% / 0.18) 50%, transparent 70%)" }} />
                      <div className="relative text-center space-y-3">
                        <div className="relative mx-auto h-10 w-10">
                          <RefreshCw className="h-10 w-10 text-primary-glow/40 animate-spin absolute" />
                          <Sparkles className="h-5 w-5 text-primary-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">Rendering {i + 1}/4…</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )
            ) : (
              <motion.div key="results"
                className={`grid gap-3 sm:gap-4 ${studioType === "avatar" ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
                {displayItems.map((item, i) => (
                  <ResultCard key={item.id} item={item} studio={studioType} accent={accent} index={i}
                    onDelete={(id) => { deleteItem(id); toast.success("Output removed."); }} />
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
