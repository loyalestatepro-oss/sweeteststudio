import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sparkles, Wand2, Download, RefreshCw, Settings2, Upload, Play, Pause, SlidersHorizontal, History, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";

export type StudioKind = "image" | "video" | "audio" | "avatar";

interface ResultSeed {
  gradient: string;
  meta: string;
}

interface StudioShellProps {
  title: string;
  subtitle: string;
  accent: string;
  icon: LucideIcon;
  promptPlaceholder: string;
  models: string[];
  presets: string[];
  results: ResultSeed[];
  creditCost?: number;
  kind: StudioKind;
}

interface GeneratedOutput {
  id: string;
  url: string;
  type: StudioKind;
  meta: string;
  gradient: string;
  prompt: string;
}

// Sample media (royalty-free / public domain test assets)
const SAMPLE_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
];

const SAMPLE_AUDIO = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
];

const ENHANCE_SUFFIXES = [
  ", cinematic lighting, 8K, ultra detailed",
  ", dramatic composition, volumetric fog, film grain",
  ", professional studio quality, award-winning",
  ", rich textures, dynamic range, editorial grade",
];

const pollinations = (prompt: string, seed: number, w = 1024, h = 1024) =>
  `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&seed=${seed}&nologo=true&enhance=true`;

const downloadUrl = async (url: string, filename: string) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objUrl);
    toast.success("Download started");
  } catch {
    window.open(url, "_blank");
  }
};

const Controls = (props: any) => {
  const { title, subtitle, accent, icon: Icon, promptPlaceholder, models, presets, rendering, prompt, setPrompt, selectedPreset, setSelectedPreset, creditCost, onGenerate } = props;
  const [creativity, setCreativity] = useState([70]);
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const user = useAuthStore((s) => s.user);

  const handleEnhance = () => {
    if (!prompt.trim()) {
      toast.error("Enter a prompt first.");
      return;
    }
    const suffix = ENHANCE_SUFFIXES[Math.floor(Math.random() * ENHANCE_SUFFIXES.length)];
    setPrompt(prompt.replace(/,?\s*(cinematic|ultra|film|professional|studio quality).*$/i, "") + suffix);
    toast.success("Prompt enhanced!");
  };

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
        <label className="text-xs uppercase tracking-widest text-muted-foreground">Prompt</label>
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
          <Button
            variant="outline"
            size="sm"
            className="glass border-border/60"
            onClick={() => toast.info("Reference uploads — coming soon.")}
          >
            <Upload className="h-3.5 w-3.5" />
          </Button>
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
                  ? "border-primary/50 bg-primary/10 text-foreground"
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

      {user && (
        <p className="text-xs text-muted-foreground">
          Balance: <span className="font-mono text-foreground">{(user.credits.total - user.credits.used).toLocaleString()}</span> credits remaining
        </p>
      )}

      <Button
        onClick={() => onGenerate(selectedModel)}
        disabled={rendering}
        className={`w-full bg-gradient-to-r ${accent} text-white border-0 shadow-glow h-11`}
      >
        {rendering ? (
          <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Rendering…</>
        ) : (
          <><Sparkles className="h-4 w-4 mr-2" /> Generate · {creditCost} credits</>
        )}
      </Button>
    </div>
  );
};

const HistoryPanel = ({ history, onPick }: { history: GeneratedOutput[]; onPick: (o: GeneratedOutput) => void }) => (
  <div className="p-5 sm:p-6">
    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Render history</p>
    {history.length === 0 ? (
      <p className="text-xs text-muted-foreground">Your renders will appear here.</p>
    ) : (
      <div className="space-y-3">
        {history.map((h, i) => (
          <div key={h.id} className="flex gap-3 group cursor-pointer hover:opacity-80 transition" onClick={() => onPick(h)}>
            <div
              className="h-14 w-20 rounded-lg flex-shrink-0 overflow-hidden bg-muted/40"
              style={{ background: h.gradient }}
            >
              {h.type === "image" || h.type === "avatar" ? (
                <img src={h.url} alt="" className="h-full w-full object-cover" loading="lazy" />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">Render #{history.length - i}</p>
              <p className="text-[10px] text-muted-foreground truncate">{h.prompt || h.meta}</p>
              <button
                className="text-[10px] text-primary-glow hover:underline mt-0.5"
                onClick={(e) => { e.stopPropagation(); downloadUrl(h.url, `nebula-${h.id}`); }}
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const MediaTile = ({ output, index, accent }: { output: GeneratedOutput; index: number; accent: string }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    const el = videoRef.current || audioRef.current;
    if (!el) return;
    if (el.paused) { el.play(); setPlaying(true); } else { el.pause(); setPlaying(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08 }}
      className="group relative aspect-video rounded-2xl overflow-hidden cursor-pointer bg-muted/40"
      style={{ backgroundImage: output.gradient }}
    >
      {(output.type === "image" || output.type === "avatar") && (
        <img src={output.url} alt={output.prompt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      )}
      {output.type === "video" && (
        <video ref={videoRef} src={output.url} className="absolute inset-0 h-full w-full object-cover" loop muted playsInline onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} />
      )}
      {output.type === "audio" && (
        <>
          <div className="absolute inset-0 noise opacity-50" />
          <audio ref={audioRef} src={output.url} onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`h-20 w-20 rounded-full bg-gradient-to-br ${accent} flex items-center justify-center shadow-glow ${playing ? "animate-pulse" : ""}`}>
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
        </>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition gap-3">
        {(output.type === "video" || output.type === "audio") && (
          <button
            className="h-12 w-12 rounded-full glass-strong flex items-center justify-center hover:scale-110 transition"
            onClick={togglePlay}
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </button>
        )}
        <button
          className="h-12 w-12 rounded-full glass-strong flex items-center justify-center hover:scale-110 transition"
          onClick={() => downloadUrl(output.url, `nebula-${output.id}`)}
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90 font-mono opacity-0 group-hover:opacity-100 transition">
        <span className="truncate pr-2">{output.meta}</span>
        <span className="px-2 py-0.5 rounded-full glass-strong shrink-0">v{index + 1}</span>
      </div>
    </motion.div>
  );
};

export const StudioShell = (props: StudioShellProps) => {
  const { title, accent, icon: Icon, results, presets, creditCost = 12, kind } = props;
  const [prompt, setPrompt] = useState("");
  const [rendering, setRendering] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(presets[0]);
  const [outputs, setOutputs] = useState<GeneratedOutput[]>([]);
  const [history, setHistory] = useState<GeneratedOutput[]>([]);
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  // Seed initial demo outputs from gradients so the canvas isn't empty
  useEffect(() => {
    setOutputs(
      results.map((r, i) => ({
        id: `seed-${i}`,
        url: kind === "image" || kind === "avatar"
          ? pollinations(`${title} showcase ${i + 1}, ${presets[0]} style, premium, professional`, 100 + i, 1024, 768)
          : kind === "video"
          ? SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length]
          : SAMPLE_AUDIO[i % SAMPLE_AUDIO.length],
        type: kind,
        meta: r.meta,
        gradient: r.gradient,
        prompt: "Showcase render",
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = (model: string) => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt before generating.");
      return;
    }
    if (user && user.credits.used + creditCost > user.credits.total) {
      toast.error("Not enough credits. Upgrade your plan.");
      return;
    }
    setRendering(true);
    const seedBase = Math.floor(Math.random() * 100000);
    const fullPrompt = `${prompt}, ${selectedPreset} style`;

    // Simulate render time (real for images since pollinations responds in ~3-8s)
    const renderTime = kind === "image" || kind === "avatar" ? 800 : 2200;

    setTimeout(() => {
      const newOutputs: GeneratedOutput[] = results.map((r, i) => ({
        id: `${Date.now()}-${i}`,
        url: kind === "image" || kind === "avatar"
          ? pollinations(fullPrompt, seedBase + i, 1024, 768)
          : kind === "video"
          ? SAMPLE_VIDEOS[Math.floor(Math.random() * SAMPLE_VIDEOS.length)]
          : SAMPLE_AUDIO[Math.floor(Math.random() * SAMPLE_AUDIO.length)],
        type: kind,
        meta: r.meta,
        gradient: r.gradient,
        prompt: fullPrompt,
      }));
      setOutputs(newOutputs);
      setHistory((prev) => [...newOutputs, ...prev].slice(0, 12));
      setRendering(false);
      if (user) {
        updateUser({ credits: { ...user.credits, used: user.credits.used + creditCost } });
      }
      toast.success("Generation complete!", { description: `${creditCost} credits used · ${model}` });
    }, renderTime);
  };

  const ctrl = { ...props, prompt, setPrompt, rendering, selectedPreset, setSelectedPreset, creditCost, onGenerate: handleGenerate };

  const handleDownloadAll = () => {
    if (outputs.length === 0) { toast.error("Nothing to download."); return; }
    outputs.forEach((o, i) => setTimeout(() => downloadUrl(o.url, `nebula-${o.id}-${i}`), i * 300));
  };

  return (
    <div className="lg:grid lg:grid-cols-[320px_1fr_320px] min-h-[calc(100vh-4rem)]">
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
              <Button variant="outline" size="sm" className="glass border-border/60">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[88vw] sm:w-96 bg-background border-border/60 overflow-y-auto">
              <Controls {...ctrl} />
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="glass border-border/60">
                <History className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-[88vw] sm:w-80 bg-background border-border/60 overflow-y-auto">
              <HistoryPanel history={history} onPick={(o) => setOutputs([o, ...outputs.slice(1)])} />
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
                <Button variant="ghost" size="sm" onClick={() => toast.info("Advanced settings — coming soon.")}>
                  <Settings2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDownloadAll}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Tabs>

          {rendering ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {results.map((_, i) => (
                <div key={i} className="aspect-video rounded-2xl overflow-hidden bg-muted/40 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <RefreshCw className="h-8 w-8 text-primary-glow animate-spin mx-auto" />
                    <p className="text-xs text-muted-foreground font-mono">Rendering…</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {outputs.map((o, i) => (
                <MediaTile key={o.id} output={o} index={i} accent={accent} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Right history (desktop) */}
      <aside className="hidden lg:block border-l border-border/60 overflow-y-auto">
        <HistoryPanel history={history} onPick={(o) => setOutputs([o, ...outputs.slice(1)])} />
      </aside>
    </div>
  );
};
