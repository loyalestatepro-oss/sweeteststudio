import { StudioShell } from "@/components/StudioShell";
import { Mic } from "lucide-react";

const results = [
  { gradient: "linear-gradient(135deg, hsl(160 70% 50%), hsl(190 95% 55%))", meta: "EN · 0:42" },
  { gradient: "linear-gradient(135deg, hsl(190 95% 55%), hsl(220 90% 55%))", meta: "ES · 0:38" },
  { gradient: "linear-gradient(135deg, hsl(140 70% 50%), hsl(170 80% 50%))", meta: "FR · 0:45" },
  { gradient: "linear-gradient(135deg, hsl(180 80% 50%), hsl(210 80% 55%))", meta: "JP · 0:39" },
];

const VoiceStudio = () => (
  <StudioShell
    title="Voice Studio"
    subtitle="Cloning & dubbing"
    accent="from-emerald-400 to-cyan-500"
    icon={Mic}
    promptPlaceholder="Welcome to Nebula Studio AI — the creative operating system for AI-native storytellers…"
    models={["nebula-voice-natural", "elevenlabs-v3", "playht-3", "openai-tts-hd"]}
    presets={["Narration", "Conversational", "News", "Cinematic", "Whisper", "Energetic"]}
    results={results}
    kind="audio"
  />
);

export default VoiceStudio;
