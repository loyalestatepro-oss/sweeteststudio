import { StudioShell } from "@/components/StudioShell";
import { UserSquare2 } from "lucide-react";

const defaultResults = [
  { gradient: "linear-gradient(135deg, hsl(330 80% 60%), hsl(280 80% 60%))", meta: "Sophia · EN · Studio" },
  { gradient: "linear-gradient(135deg, hsl(20 80% 55%), hsl(340 70% 55%))", meta: "Marcus · EN · Office" },
  { gradient: "linear-gradient(135deg, hsl(270 70% 60%), hsl(220 80% 55%))", meta: "Aiko · JP · Casual" },
  { gradient: "linear-gradient(135deg, hsl(10 80% 60%), hsl(340 80% 60%))", meta: "Diego · ES · Cinematic" },
];

const AvatarStudio = () => (
  <StudioShell
    title="Avatar Studio"
    subtitle="Photoreal speakers"
    accent="from-rose-400 to-violet-500"
    icon={UserSquare2}
    studioType="avatar"
    promptPlaceholder="Hi! I'm your virtual brand spokesperson. Today I'll walk you through our new product line…"
    models={["nebula-avatar-pro", "heygen-v4", "synthesia-2", "did-premium"]}
    presets={["Studio", "Outdoor", "Office", "News desk", "Casual", "Cinematic"]}
    defaultResults={defaultResults}
    creditCost={20}
  />
);
export default AvatarStudio;
