// Edge function: generate-music
// Generates music via Suno API or returns a rich waveform preview with metadata.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function randInRange(min: number, max: number) { return min + Math.floor(Math.random() * (max - min)); }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, preset = "Pop", count = 4 } = await req.json();
    if (!prompt?.trim()) {
      return new Response(JSON.stringify({ error: "Prompt required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sunoKey = Deno.env.get("SUNO_API_KEY");
    const n = Math.max(1, Math.min(4, Number(count)));

    // Attempt real Suno generation if key is configured
    if (sunoKey) {
      try {
        const sunoResp = await fetch("https://api.suno.ai/api/v1/generate", {
          method: "POST",
          headers: { Authorization: `Bearer ${sunoKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, style: preset, count: n }),
        });
        if (sunoResp.ok) {
          const data = await sunoResp.json();
          const tracks = (data.tracks || data.clips || []).slice(0, n).map((t: any) => ({
            id: t.id || crypto.randomUUID(),
            title: t.title || prompt.slice(0, 30),
            audioUrl: t.audio_url || t.url,
            duration: t.duration || `${randInRange(1,4)}:${randInRange(10,59).toString().padStart(2,"0")}`,
            bpm: t.bpm || randInRange(80, 140),
            preset,
          }));
          return new Response(JSON.stringify({ tracks }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (e) { console.error("suno error", e); }
    }

    // Fallback: return rich metadata for waveform display
    const bpms: Record<string, number[]> = {
      Pop: [118,124,128], Cinematic: [60,72,80], "Lo-fi": [75,80,88],
      Electronic: [128,138,145], Acoustic: [96,104,110], "Hip-hop": [90,96,100],
    };
    const bpmPool = bpms[preset] || bpms.Pop;
    const tracks = Array.from({ length: n }, (_, i) => {
      const mins = randInRange(1, 4);
      const secs = randInRange(10, 59).toString().padStart(2, "0");
      return {
        id: crypto.randomUUID(),
        title: prompt.slice(0, 30),
        audioUrl: null,
        duration: `${mins}:${secs}`,
        bpm: bpmPool[i % bpmPool.length],
        preset,
        fallback: true,
      };
    });
    return new Response(JSON.stringify({ tracks, fallback: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
