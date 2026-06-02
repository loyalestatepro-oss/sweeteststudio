import { StudioShell } from "@/components/StudioShell";
import { Image as ImageIcon } from "lucide-react";

const defaultResults = [
  { gradient: "linear-gradient(135deg, hsl(200 90% 55%), hsl(170 90% 50%))", meta: "1024×1024 · Editorial" },
  { gradient: "linear-gradient(135deg, hsl(280 90% 60%), hsl(200 90% 55%))", meta: "1024×1024 · Product" },
  { gradient: "linear-gradient(135deg, hsl(38 92% 60%), hsl(0 80% 60%))", meta: "1536×1024 · Illustration" },
  { gradient: "linear-gradient(135deg, hsl(150 70% 50%), hsl(190 95% 55%))", meta: "1024×1536 · 3D Render" },
];

const ImageStudio = () => (
  <StudioShell
    title="Image Studio"
    subtitle="Concept art & design"
    accent="from-cyan-400 to-blue-500"
    icon={ImageIcon}
    studioType="image"
    promptPlaceholder="A minimalist product shot of a glass perfume bottle, studio softbox, marble surface, editorial Vogue style…"
    models={["nebula-image-xl", "midjourney-v7", "flux-pro", "ideogram-2", "imagen-3"]}
    presets={["Editorial", "Product", "Illustration", "3D render", "Anime", "Sketch"]}
    defaultResults={defaultResults}
    creditCost={8}
  />
);
export default ImageStudio;
