import { StudioShell } from "@/components/StudioShell";
import { Mic } from "lucide-react";

const defaultResults = [
  { gradient: "linear-gradient(135deg, hsl(160 70% 50%), hsl(190 95% 55%))", meta: "EN · 0:42 · Narration" },
  { gradient: "linear-gradient(135deg, hsl(190 95% 55%), hsl(220 90% 55%))", meta: "ES · 0:38 · Conversational" },
  { gradient: "linear-gradient(135deg, hsl(140 70% 50%), hsl(170 80% 50%))", meta: "FR · 0:45 · Cinematic" },
  { gradient: "linear-gradient(135deg, hsl(180 80% 50%), hsl(210 80% 55%))", meta: "JP · 0:39 · Whisper" },
];

const VoiceStudio = () => (
  <StudioShell
    title="Voice Studio"
    subtitle="Cloning & dubbing"
    accent="from-emerald-400 to-cyan-500"
    icon={Mic}
    studioType="voice"
    promptPlaceholder="Welcome to Sweetest Studio AI — the creative operating system for AI-native storytellers…"
    models={["nebula-voice-natural", "elevenlabs-v3", "playht-3", "openai-tts-hd"]}
    presets={["Narration", "Conversational", "News", "Cinematic", "Whisper", "Energetic"]}
    defaultResults={defaultResults}
    creditCost={6}
  />
);
export default VoiceStudio;
