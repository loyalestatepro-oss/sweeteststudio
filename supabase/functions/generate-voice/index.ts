// Edge function: generate-voice
// Uses StreamElements TTS — a free public TTS endpoint, no API key required.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// preset → (StreamElements voice id, language label)
const VOICE_MAP: Record<string, { voice: string; lang: string }[]> = {
  Narration:      [{ voice: "Brian",   lang: "EN" }, { voice: "Matthew", lang: "EN" }, { voice: "Joey",    lang: "EN" }, { voice: "Russell", lang: "EN" }],
  Conversational: [{ voice: "Joanna",  lang: "EN" }, { voice: "Kimberly",lang: "EN" }, { voice: "Salli",   lang: "EN" }, { voice: "Ivy",     lang: "EN" }],
  News:           [{ voice: "Matthew", lang: "EN" }, { voice: "Joanna",  lang: "EN" }, { voice: "Brian",   lang: "EN" }, { voice: "Amy",     lang: "EN" }],
  Cinematic:      [{ voice: "Joey",    lang: "EN" }, { voice: "Russell", lang: "EN" }, { voice: "Brian",   lang: "EN" }, { voice: "Geraint", lang: "EN" }],
  Whisper:        [{ voice: "Amy",     lang: "EN" }, { voice: "Emma",    lang: "EN" }, { voice: "Nicole",  lang: "EN" }, { voice: "Salli",   lang: "EN" }],
  Energetic:      [{ voice: "Justin",  lang: "EN" }, { voice: "Ivy",     lang: "EN" }, { voice: "Kendra",  lang: "EN" }, { voice: "Joey",    lang: "EN" }],
};

function bufToB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk) as unknown as number[]);
  }
  return btoa(bin);
}

async function synth(voice: string, text: string): Promise<string | null> {
  try {
    const url = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(voice)}&text=${encodeURIComponent(text)}`;
    const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!resp.ok) {
      console.error("streamelements", voice, resp.status);
      return null;
    }
    const buf = await resp.arrayBuffer();
    if (buf.byteLength < 200) return null;
    return `data:audio/mpeg;base64,${bufToB64(buf)}`;
  } catch (e) {
    console.error("streamelements exception", e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, preset = "Narration", count = 4 } = await req.json();
    if (!prompt?.trim()) {
      return new Response(JSON.stringify({ error: "Prompt required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // StreamElements caps text length; keep it reasonable.
    const text = String(prompt).slice(0, 500);
    const pool = VOICE_MAP[preset] || VOICE_MAP.Narration;
    const n = Math.max(1, Math.min(4, Number(count)));
    const wordCount = text.trim().split(/\s+/).length;
    const estSecs = Math.max(2, Math.round(wordCount / 2.5));
    const durStr = `${Math.floor(estSecs / 60)}:${(estSecs % 60).toString().padStart(2, "0")}`;

    const tasks = Array.from({ length: n }, (_, i) => synth(pool[i % pool.length].voice, text));
    const results = await Promise.all(tasks);

    const clips = results.map((audioUrl, i) => ({
      id: crypto.randomUUID(),
      audioUrl,
      duration: durStr,
      preset,
      lang: pool[i % pool.length].lang,
      voice: pool[i % pool.length].voice,
      fallback: !audioUrl,
    }));
    const fallback = results.every((r) => !r);

    return new Response(JSON.stringify({ clips, fallback }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
