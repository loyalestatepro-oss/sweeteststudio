import { StudioShell } from "@/components/StudioShell";
import { Music } from "lucide-react";

const results = [
  { gradient: "linear-gradient(135deg, hsl(38 92% 60%), hsl(320 90% 60%))", meta: "2:14 · 124 BPM" },
  { gradient: "linear-gradient(135deg, hsl(0 80% 60%), hsl(38 92% 60%))", meta: "3:02 · 92 BPM" },
  { gradient: "linear-gradient(135deg, hsl(290 80% 60%), hsl(330 90% 60%))", meta: "1:48 · 140 BPM" },
  { gradient: "linear-gradient(135deg, hsl(50 95% 55%), hsl(20 90% 55%))", meta: "4:20 · 110 BPM" },
];

const MusicStudio = () => (
  <StudioShell
    title="Music Studio"
    subtitle="Tracks & scoring"
    accent="from-amber-400 to-pink-500"
    icon={Music}
    promptPlaceholder="An uplifting indie-pop anthem, female vocals, summer festival energy, crisp drums, 124 BPM…"
    models={["nebula-music-v2", "suno-v4", "udio-1.5", "musicgen-large"]}
    presets={["Pop", "Cinematic", "Lo-fi", "Electronic", "Acoustic", "Hip-hop"]}
    results={results}
    kind="audio"
  />
);

export default MusicStudio;
