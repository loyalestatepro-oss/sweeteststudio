import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const cats = ["All", "Video", "Image", "Music", "Voice", "Avatar", "Marketing", "Social"];

const templates = [
  { name: "Instagram Reel", cat: "Social", route: "/app/video" },
  { name: "TikTok Hook", cat: "Social", route: "/app/video" },
  { name: "YouTube Intro", cat: "Video", route: "/app/video" },
  { name: "Product Reveal", cat: "Marketing", route: "/app/video" },
  { name: "Brand Anthem", cat: "Music", route: "/app/music" },
  { name: "Podcast Clip", cat: "Voice", route: "/app/voice" },
  { name: "Logo Animation", cat: "Video", route: "/app/video" },
  { name: "Cinematic Trailer", cat: "Video", route: "/app/video" },
  { name: "Avatar Pitch", cat: "Avatar", route: "/app/avatar" },
  { name: "Lyric Video", cat: "Music", route: "/app/music" },
  { name: "Voiceover Ad", cat: "Voice", route: "/app/voice" },
  { name: "Story Cover", cat: "Image", route: "/app/image" },
  { name: "Product Shot", cat: "Image", route: "/app/image" },
  { name: "Talking Head", cat: "Avatar", route: "/app/avatar" },
  { name: "Brand Sizzle", cat: "Marketing", route: "/app/video" },
  { name: "Event Promo", cat: "Social", route: "/app/video" },
].map((t, i) => ({
  ...t,
  gradient: `linear-gradient(${130 + i * 20}deg, hsl(${250 + i * 18} 80% 55%), hsl(${180 + i * 12} 90% 55%))`,
}));

const Templates = () => {
  const [activeTab, setActiveTab] = useState("All");
  const navigate = useNavigate();

  const filtered = activeTab === "All" ? templates : templates.filter((t) => t.cat === activeTab);

  const handleUse = (t: typeof templates[0]) => {
    toast.success(`Loading "${t.name}" template…`);
    setTimeout(() => navigate(t.route), 500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl flex items-center gap-3">
          <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary-glow" /> Templates
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Production-ready starting points — fork, remix, ship.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass flex-wrap h-auto gap-0.5">
          {cats.map((c) => <TabsTrigger key={c} value={c}>{c}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <p className="text-muted-foreground">No templates in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map((t) => (
            <div
              key={t.name}
              className="group glass rounded-2xl overflow-hidden cursor-pointer hover:border-primary/40 transition-all hover:-translate-y-1"
              onClick={() => handleUse(t)}
            >
              <div className="aspect-[4/5] noise relative" style={{ background: t.gradient }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full glass-strong">{t.cat}</span>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <span className="text-xs px-3 py-2 rounded-full glass-strong flex items-center gap-1.5">
                    Use template <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="font-medium text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Use template →</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Templates;
