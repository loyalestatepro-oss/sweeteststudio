// Edge function: generate-voice
// Synthesizes voice using ElevenLabs or returns rich preview metadata.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VOICE_MAP: Record<string, string> = {
  Narration: "EXAVITQu4vr4xnSDxMaL",
  Conversational: "JBFqnCBsd6RMkjVDRZzb",
  News: "IKne3meq5aSn9XLyUdCD",
  Cinematic: "nPczCjzI2devNBz1zQrb",
  Whisper: "XB0fDUnXU5powFXDhCwa",
  Energetic: "TX3LPaxmHKxFdv7VOQHJ",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, preset = "Narration", count = 4 } = await req.json();
    if (!prompt?.trim()) {
      return new Response(JSON.stringify({ error: "Prompt required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const elevenKey = Deno.env.get("ELEVENLABS_API_KEY");
    const voiceId = VOICE_MAP[preset] || VOICE_MAP.Narration;
    const n = Math.max(1, Math.min(4, Number(count)));
    const wordCount = prompt.trim().split(/\s+/).length;
    const estSecs = Math.round(wordCount / 2.5); // ~150 WPM
    const durStr = `${Math.floor(estSecs / 60)}:${(estSecs % 60).toString().padStart(2, "0")}`;

    if (elevenKey) {
      try {
        // Generate one real clip and duplicate metadata for count
        const resp = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
          {
            method: "POST",
            headers: { "xi-api-key": elevenKey, "Content-Type": "application/json" },
            body: JSON.stringify({
              text: prompt,
              model_id: "eleven_multilingual_v2",
              voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true },
            }),
          }
        );
        if (resp.ok) {
          const buffer = await resp.arrayBuffer();
          const b64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
          const dataUrl = `data:audio/mpeg;base64,${b64}`;
          const clips = Array.from({ length: n }, (_, i) => ({
            id: crypto.randomUUID(),
            audioUrl: dataUrl,
            duration: durStr,
            preset,
            lang: ["EN", "ES", "FR", "DE"][i % 4],
          }));
          return new Response(JSON.stringify({ clips }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (e) { console.error("elevenlabs error", e); }
    }

    // Fallback: return metadata so UI can render waveform
    const clips = Array.from({ length: n }, (_, i) => ({
      id: crypto.randomUUID(),
      audioUrl: null,
      duration: durStr,
      preset,
      lang: ["EN", "ES", "FR", "DE"][i % 4],
      fallback: true,
    }));
    return new Response(JSON.stringify({ clips, fallback: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
