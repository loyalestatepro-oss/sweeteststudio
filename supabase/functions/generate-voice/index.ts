// Edge function: generate-voice
// Uses StreamElements TTS — a free public TTS endpoint, no API key required.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// preset → list of (Google Translate TTS lang codes, display label).
// Google's public translate_tts endpoint is free, no key required, returns MP3.
const VOICE_MAP: Record<string, { tld: string; lang: string; label: string }[]> = {
  Narration:      [{ tld: "com", lang: "en",    label: "EN-US" }, { tld: "co.uk", lang: "en", label: "EN-UK" }, { tld: "com.au", lang: "en", label: "EN-AU" }, { tld: "ca", lang: "en", label: "EN-CA" }],
  Conversational: [{ tld: "com", lang: "en",    label: "EN" },    { tld: "com", lang: "es",   label: "ES" },    { tld: "com", lang: "fr",   label: "FR" },    { tld: "com", lang: "de",   label: "DE" }],
  News:           [{ tld: "com", lang: "en",    label: "EN" },    { tld: "co.uk", lang: "en", label: "EN-UK" }, { tld: "com", lang: "de",   label: "DE" },    { tld: "com", lang: "it",   label: "IT" }],
  Cinematic:      [{ tld: "com", lang: "en",    label: "EN" },    { tld: "com", lang: "it",   label: "IT" },    { tld: "com", lang: "fr",   label: "FR" },    { tld: "com", lang: "ja",   label: "JP" }],
  Whisper:        [{ tld: "com", lang: "en",    label: "EN" },    { tld: "co.uk", lang: "en", label: "EN-UK" }, { tld: "com", lang: "fr",   label: "FR" },    { tld: "com", lang: "pt",   label: "PT" }],
  Energetic:      [{ tld: "com", lang: "en",    label: "EN" },    { tld: "com", lang: "es",   label: "ES" },    { tld: "com", lang: "pt",   label: "PT-BR" }, { tld: "com", lang: "ko",   label: "KR" }],
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

// Google Translate TTS only accepts ~200-char chunks. We split, fetch each, then concat the MP3 frames.
function chunkText(text: string, max = 180): string[] {
  const out: string[] = [];
  const sentences = text.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+/);
  let cur = "";
  for (const s of sentences) {
    if ((cur + " " + s).trim().length > max) {
      if (cur) out.push(cur.trim());
      if (s.length > max) {
        // hard split very long sentence by spaces
        const words = s.split(" ");
        let buf = "";
        for (const w of words) {
          if ((buf + " " + w).trim().length > max) { out.push(buf.trim()); buf = w; }
          else buf = buf ? buf + " " + w : w;
        }
        if (buf) cur = buf;
        else cur = "";
      } else cur = s;
    } else cur = cur ? cur + " " + s : s;
  }
  if (cur) out.push(cur.trim());
  return out.length ? out : [text.slice(0, max)];
}

async function synth(tld: string, lang: string, text: string): Promise<string | null> {
  try {
    const chunks = chunkText(text);
    const buffers: Uint8Array[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const url = `https://translate.google.${tld}/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunks[i])}&tl=${lang}&total=${chunks.length}&idx=${i}&textlen=${chunks[i].length}&client=tw-ob`;
      const resp = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://translate.google.com/",
        },
      });
      if (!resp.ok) {
        console.error("gtts", lang, resp.status);
        return null;
      }
      const buf = new Uint8Array(await resp.arrayBuffer());
      if (buf.byteLength < 200) return null;
      buffers.push(buf);
    }
    const total = buffers.reduce((s, b) => s + b.byteLength, 0);
    const merged = new Uint8Array(total);
    let off = 0;
    for (const b of buffers) { merged.set(b, off); off += b.byteLength; }
    return `data:audio/mpeg;base64,${bufToB64(merged.buffer)}`;
  } catch (e) {
    console.error("gtts exception", e);
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
