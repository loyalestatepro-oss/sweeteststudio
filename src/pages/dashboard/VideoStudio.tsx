import { StudioShell } from "@/components/StudioShell";
import { Video } from "lucide-react";

const results = [
  { gradient: "linear-gradient(135deg, hsl(270 90% 55%), hsl(320 90% 60%))", meta: "8s · 21:9 · 1080p" },
  { gradient: "linear-gradient(135deg, hsl(220 90% 55%), hsl(190 95% 55%))", meta: "8s · 16:9 · 1080p" },
  { gradient: "linear-gradient(135deg, hsl(340 90% 60%), hsl(38 92% 60%))", meta: "5s · 9:16 · 1080p" },
  { gradient: "linear-gradient(135deg, hsl(160 80% 50%), hsl(190 95% 55%))", meta: "10s · 21:9 · 4K" },
];

const VideoStudio = () => (
  <StudioShell
    title="Video Studio"
    subtitle="Cinematic generation"
    accent="from-violet-500 to-fuchsia-500"
    icon={Video}
    promptPlaceholder="A neon-drenched skyline at dusk, anamorphic lens, drifting fog, slow dolly forward, 35mm grain…"
    models={["nebula-cinematic-1080", "veo-3-preview", "sora-turbo", "kling-2.0", "runway-gen4"]}
    presets={["Cinematic", "Anime", "Photoreal", "Hand-drawn", "Vintage", "Sci-fi"]}
    results={results}
    kind="video"
  />
);

export default VideoStudio;
