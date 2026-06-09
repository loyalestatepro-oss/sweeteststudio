// Edge function: generate-video  
// Streams SSE progress while generating 3 cinematic keyframes via Lovable AI Gateway.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const enc = new TextEncoder();
const sse = (event: string, data: unknown) =>
  enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

function hashStr(s: string): number {
  return s.split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
}

function fallbackFrame(prompt: string, idx: number, aspect: string): string {
  const seed = Math.abs(hashStr(`${prompt}-${idx}-${aspect}`));
  const hA = (seed + idx * 47) % 360;
  const hB = (hA + 72 + idx * 13) % 360;
  const hC = (hA + 148) % 360;
  const w = 1536, h = aspect === "9:16" ? 1536 : 864;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="hsl(${hA} 78% 10%)"/>
        <stop offset=".55" stop-color="hsl(${hB} 80% 28%)"/>
        <stop offset="1" stop-color="hsl(${hC} 90% 58%)"/>
      </linearGradient>
      <radialGradient id="sun" cx="${34+idx*18}%" cy="${28+idx*8}%" r="32%">
        <stop stop-color="hsl(42 100% 72%/.85)"/>
        <stop offset=".35" stop-color="hsl(${hC} 92% 58%/.32)"/>
        <stop offset="1" stop-color="hsl(0 0% 0%/0)"/>
      </radialGradient>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="3"/>
        <feColorMatrix type="saturate" values="0"/>
        <feComponentTransfer><feFuncA type="table" tableValues="0 .16"/></feComponentTransfer>
      </filter>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <rect width="${w}" height="${h}" fill="url(#sun)"/>
    <path d="M0 ${h*(0.68-idx*.04)}C${w*.22} ${h*.48} ${w*.48} ${h*.88} ${w} ${h*(0.5+idx*.05)}L${w} ${h} 0 ${h}Z" fill="hsl(${hB} 82% 42%/.42)"/>
    <rect y="0" width="${w}" height="${h*.09}" fill="hsl(0 0% 0%/.6)"/>
    <rect y="${h*.91}" width="${w}" height="${h*.09}" fill="hsl(0 0% 0%/.6)"/>
    <rect width="${w}" height="${h}" filter="url(#grain)"/>
    <text x="${w*.5}" y="${h*.5}" text-anchor="middle" dominant-baseline="middle"
      font-family="system-ui" font-size="${h*.025}" fill="hsl(0 0% 100%/.5)" xml:space="preserve">Shot ${idx+1}: ${prompt.slice(0,50)}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function generateKeyframe(apiKey: string, prompt: string): Promise<string | null> {
  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });
    if (!resp.ok) { console.error("keyframe", resp.status, await resp.text()); return null; }
    const data = await resp.json();
    const choice = data?.choices?.[0];
    return (
      choice?.message?.images?.[0]?.image_url?.url ||
      choice?.message?.content?.[0]?.image_url?.url ||
      null
    );
  } catch (e) { console.error("keyframe exception", e); return null; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, aspectRatio = "16:9" } = await req.json();
    if (!prompt?.trim()) {
      return new Response(JSON.stringify({ error: "Prompt required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    const aspectHint = aspectRatio === "9:16" ? "vertical 9:16 portrait" : aspectRatio === "1:1" ? "square 1:1" : "cinematic 16:9 widescreen";

    const beats = [
      `${prompt}. Opening wide establishing shot, ${aspectHint}, cinematic lighting, 35mm film grain, dramatic composition, ultra-detailed.`,
      `${prompt}. Mid shot, pushed closer, dynamic motion blur, anamorphic lens flare, ${aspectHint}, color graded atmosphere.`,
      `${prompt}. Hero close-up, intimate detail, shallow focus, golden hour, ${aspectHint}, editorial cinematography.`,
    ];

    const stream = new ReadableStream({
      async start(ctrl) {
        try {
          ctrl.enqueue(sse("stage", { step: 0, total: 5, label: "Analyzing prompt…" }));
          await new Promise(r => setTimeout(r, 300));
          ctrl.enqueue(sse("stage", { step: 1, total: 5, label: "Storyboarding shots…" }));
          await new Promise(r => setTimeout(r, 300));

          const frames: string[] = [];
          for (let i = 0; i < beats.length; i++) {
            ctrl.enqueue(sse("stage", { step: 2 + i, total: 5, label: `Rendering keyframe ${i+1}/3…` }));
            let url: string | null = null;
            if (apiKey) {
              url = await generateKeyframe(apiKey, beats[i]);
            }
            if (!url) url = fallbackFrame(prompt, i, aspectRatio);
            frames.push(url);
            ctrl.enqueue(sse("frame", { index: i, url, fallback: !apiKey }));
          }

          ctrl.enqueue(sse("done", { frames }));
          ctrl.close();
        } catch (err) {
          ctrl.enqueue(sse("error", { message: (err as Error).message }));
          ctrl.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
