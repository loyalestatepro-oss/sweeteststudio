// Edge function: generate-image
// Primary: Pollinations.ai (free, no key). Fallback: Lovable AI Gateway. Final: SVG.
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
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="hsl(${hA} 78% 14%)"/><stop offset=".52" stop-color="hsl(${hB} 84% 32%)"/>
      <stop offset="1" stop-color="hsl(${hC} 88% 58%)"/></linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <text x="${w*.5}" y="${h*.5}" text-anchor="middle" font-family="system-ui" font-size="${h*.03}" fill="hsl(0 0% 100%/.7)">${prompt.slice(0,60)}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function fetchPollinations(prompt: string, idx: number, aspect: string): Promise<string | null> {
  try {
    const sq = aspect === "1:1";
    const vert = aspect === "9:16";
    const w = sq ? 1024 : vert ? 720 : 1280;
    const h = sq ? 1024 : vert ? 1280 : 720;
    const seed = Math.abs(hashStr(prompt) + idx * 7919) % 1000000;
    const enc = encodeURIComponent(prompt);
    const url = `https://image.pollinations.ai/prompt/${enc}?width=${w}&height=${h}&seed=${seed}&nologo=true&enhance=true&referrer=lovable.app`;
    const resp = await fetch(url);
    if (!resp.ok) { console.error("pollinations", resp.status); return null; }
    const buf = new Uint8Array(await resp.arrayBuffer());
    if (buf.length < 1000) return null;
    let bin = ""; for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
    return `data:image/jpeg;base64,${btoa(bin)}`;
  } catch (e) { console.error("pollinations err", e); return null; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const prompt: string = body.prompt ?? "";
    const count: number = Math.max(1, Math.min(4, Number(body.count) || 4));
    const aspectRatio: string = body.aspectRatio ?? "16:9";
    if (!prompt.trim()) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const variations = [prompt, `${prompt}, cinematic lighting, ultra detailed`, `${prompt}, different angle, vibrant colors`, `${prompt}, artistic composition, dramatic`];
    const tasks = Array.from({ length: count }, (_, i) => fetchPollinations(variations[i] || prompt, i, aspectRatio));
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
