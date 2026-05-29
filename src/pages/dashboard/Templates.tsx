import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles } from "lucide-react";

const cats = ["All", "Video", "Image", "Music", "Voice", "Avatar", "Marketing", "Social"];

const templates = Array.from({ length: 12 }).map((_, i) => ({
  name: ["Instagram Reel", "TikTok Hook", "YouTube Intro", "Product Reveal", "Brand Anthem", "Podcast Clip", "Logo Animation", "Cinematic Trailer", "Avatar Pitch", "Lyric Video", "Voiceover Ad", "Story Cover"][i],
  cat: ["Social", "Social", "Video", "Marketing", "Music", "Voice", "Video", "Video", "Avatar", "Music", "Voice", "Image"][i],
  gradient: `linear-gradient(${130 + i * 25}deg, hsl(${250 + i * 20} 80% 55%), hsl(${180 + i * 15} 90% 55%))`,
}));

const Templates = () => (
  <div className="p-8 max-w-7xl space-y-6">
    <div>
      <h1 className="font-display text-4xl flex items-center gap-3">
        <Sparkles className="h-7 w-7 text-primary-glow" /> Templates
      </h1>
      <p className="text-sm text-muted-foreground mt-1">Production-ready starting points — fork, remix, ship.</p>
    </div>

    <Tabs defaultValue="All">
      <TabsList className="glass">
        {cats.map((c) => <TabsTrigger key={c} value={c}>{c}</TabsTrigger>)}
      </TabsList>
    </Tabs>

    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {templates.map((t) => (
        <div key={t.name} className="group glass rounded-2xl overflow-hidden cursor-pointer hover:border-primary/40 transition-all hover:-translate-y-1">
          <div className="aspect-[4/5] noise relative" style={{ background: t.gradient }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full glass-strong">{t.cat}</span>
          </div>
          <div className="p-4">
            <p className="font-medium text-sm">{t.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Use template →</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Templates;
