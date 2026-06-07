// Edge function: generate-image
// Uses Lovable AI Gateway (Gemini Flash Image) with robust fallback to premium SVG
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function hashStr(s: string): number {
  return s.split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
}

function premiumSVG(prompt: string, idx: number, aspect: string): string {
  const seed = Math.abs(hashStr(`${prompt}-${idx}-${aspect}`));
  const hA = (seed + idx * 41) % 360;
  const hB = (hA + 64 + idx * 17) % 360;
  const hC = (hA + 138) % 360;
  const sq = aspect === "1:1";
  const w = sq ? 1024 : 1536, h = sq ? 1024 : 864;
  const subj = sq
    ? `<circle cx="${w/2}" cy="${h*.42}" r="${h*.16}" fill="hsl(${hC} 72% 72%/.88)"/>
       <path d="M${w*.28} ${h*.92}C${w*.34} ${h*.66} ${w*.66} ${h*.66} ${w*.72} ${h*.92}Z" fill="hsl(${hB} 70% 54%/.82)"/>`
    : `<path d="M0 ${h*.72}C${w*.25} ${h*.48} ${w*.42} ${h*.88} ${w} ${h*.55}L${w} ${h} 0 ${h}Z" fill="hsl(${hB} 74% 48%/.42)"/>
       <circle cx="${w*.72}" cy="${h*.3}" r="${h*.18}" fill="hsl(${hC} 86% 62%/.52)"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="hsl(${hA} 78% 14%)"/>
        <stop offset=".52" stop-color="hsl(${hB} 84% 32%)"/>
        <stop offset="1" stop-color="hsl(${hC} 88% 58%)"/>
      </linearGradient>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".78" numOctaves="3"/>
        <feColorMatrix type="saturate" values="0"/>
        <feComponentTransfer><feFuncA type="table" tableValues="0 .18"/></feComponentTransfer>
      </filter>
      <radialGradient id="spot" cx="38%" cy="24%" r="70%">
        <stop stop-color="hsl(0 0% 100%/.35)"/>
        <stop offset=".42" stop-color="hsl(0 0% 100%/.08)"/>
        <stop offset="1" stop-color="hsl(0 0% 0%/.34)"/>
      </radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    ${subj}
    <rect width="${w}" height="${h}" fill="url(#spot)"/>
    <rect width="${w}" height="${h}" filter="url(#grain)"/>
    <text x="${w*.5}" y="${h*.5}" text-anchor="middle" dominant-baseline="middle"
      font-family="system-ui" font-size="${h*.028}" fill="hsl(0 0% 100%/.55)" xml:space="preserve">${prompt.slice(0,60)}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function callGateway(apiKey: string, styledPrompt: string): Promise<string | null> {
  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-preview-05-20",
        messages: [{ role: "user", content: styledPrompt }],
        modalities: ["image", "text"],
      }),
    });
    if (!resp.ok) {
      console.error("gateway", resp.status, await resp.text());
      return null;
    }
    const data = await resp.json();
    const choice = data?.choices?.[0];
    const url =
      choice?.message?.images?.[0]?.image_url?.url ||
      choice?.message?.content?.[0]?.image_url?.url ||
      choice?.message?.image_url?.url ||
      null;
    return url;
  } catch (e) {
    console.error("gateway exception", e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const prompt: string = body.prompt ?? "";
    const count: number = Number(body.count) || 4;
    const aspectRatio: string = body.aspectRatio ?? "16:9";

    if (!prompt.trim()) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    const n = Math.max(1, Math.min(4, count));
    const aspectHint = aspectRatio === "1:1" ? "square 1:1" : aspectRatio === "9:16" ? "vertical 9:16" : "cinematic 16:9 widescreen";
    const styled = `${prompt}. Ultra-detailed, professional, ${aspectHint}, premium quality, sharp focus, photorealistic.`;

    if (!apiKey) {
      const images = Array.from({ length: n }, (_, i) => premiumSVG(prompt, i, aspectRatio));
      return new Response(JSON.stringify({ images, fallback: true, detail: "no_api_key" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tasks = Array.from({ length: n }, (_, i) =>
      callGateway(apiKey, i === 0 ? styled : `${styled} Variation ${i + 1}, unique angle, different composition.`)
    );
    const results = await Promise.all(tasks);
    const images = results.map((u, i) => u ?? premiumSVG(prompt, i, aspectRatio));
    const allFallback = results.every((u) => !u);

    return new Response(JSON.stringify({ images, fallback: allFallback }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-image error", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
