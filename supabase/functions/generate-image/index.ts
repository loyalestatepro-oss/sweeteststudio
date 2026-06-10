// Edge function: generate-image
// Primary: Lovable AI Gateway (Gemini image). Fallback: Cloudflare Flux (if creds). Then Pollinations. Final: SVG.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const CF_ACCOUNT_ID = Deno.env.get("CLOUDFLARE_ACCOUNT_ID");
const CF_API_TOKEN = Deno.env.get("CLOUDFLARE_API_TOKEN");

function hashStr(s: string): number {
  return s.split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
}

function bufToB64(buf: Uint8Array): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < buf.length; i += chunk) {
    bin += String.fromCharCode.apply(null, Array.from(buf.subarray(i, i + chunk)) as number[]);
  }
  return btoa(bin);
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

async function fetchLovableGemini(prompt: string): Promise<string | null> {
  if (!LOVABLE_API_KEY) return null;
  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });
    if (!resp.ok) {
      console.error("lovable gemini", resp.status, (await resp.text().catch(() => "")).slice(0, 200));
      return null;
    }
    const j = await resp.json();
    const images = j?.choices?.[0]?.message?.images;
    const url = images?.[0]?.image_url?.url;
    if (typeof url === "string" && url.startsWith("data:image")) return url;
    return null;
  } catch (e) {
    console.error("lovable gemini err", e);
    return null;
  }
}

async function fetchCloudflareFlux(prompt: string, idx: number, aspect: string): Promise<string | null> {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) return null;
  try {
    const sq = aspect === "1:1";
    const vert = aspect === "9:16";
    const width = sq ? 1024 : vert ? 768 : 1280;
    const height = sq ? 1024 : vert ? 1280 : 720;
    const seed = Math.abs(hashStr(prompt) + idx * 7919) % 1000000;
    const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${CF_API_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, width, height, num_steps: 4, seed }),
    });
    if (!resp.ok) { console.error("cf flux", resp.status); return null; }
    const ct = resp.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const j = await resp.json();
      const b64 = j?.result?.image;
      if (typeof b64 === "string" && b64.length > 500) return `data:image/jpeg;base64,${b64}`;
      return null;
    }
    const buf = new Uint8Array(await resp.arrayBuffer());
    if (buf.length < 1000) return null;
    return `data:image/png;base64,${bufToB64(buf)}`;
  } catch (e) { console.error("cf flux err", e); return null; }
}

async function fetchPollinations(prompt: string, idx: number, aspect: string): Promise<string | null> {
  try {
    const sq = aspect === "1:1";
    const vert = aspect === "9:16";
    const w = sq ? 1024 : vert ? 720 : 1280;
    const h = sq ? 1024 : vert ? 1280 : 720;
    const seed = Math.abs(hashStr(prompt) + idx * 7919) % 1000000;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&seed=${seed}&nologo=true&enhance=true&referrer=lovable.app`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const buf = new Uint8Array(await resp.arrayBuffer());
    if (buf.length < 1000) return null;
    return `data:image/jpeg;base64,${bufToB64(buf)}`;
  } catch { return null; }
}

async function generateOne(prompt: string, idx: number, aspect: string): Promise<string | null> {
  return (
    (await fetchLovableGemini(prompt)) ??
    (await fetchCloudflareFlux(prompt, idx, aspect)) ??
    (await fetchPollinations(prompt, idx, aspect))
  );
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
    const tasks = Array.from({ length: count }, (_, i) => generateOne(variations[i] || prompt, i, aspectRatio));
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
