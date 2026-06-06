// Edge function: generate-image
// Uses Lovable AI Gateway to generate real images via google/gemini-2.5-flash-image
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function hashPrompt(input: string): number {
  return input.split("").reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
}

function createPremiumFallback(prompt: string, index: number, aspectRatio: string): string {
  const seed = Math.abs(hashPrompt(`${prompt}-${index}-${aspectRatio}`));
  const hueA = (seed + index * 41) % 360;
  const hueB = (hueA + 64 + index * 17) % 360;
  const hueC = (hueA + 138) % 360;
  const square = aspectRatio === "1:1";
  const width = square ? 1024 : 1536;
  const height = square ? 1024 : 864;
  const subject = square
    ? `<circle cx="${width / 2}" cy="${height * 0.42}" r="${height * 0.16}" fill="hsl(${hueC} 72% 72% / .88)"/><path d="M${width * 0.28} ${height * 0.92}C${width * 0.34} ${height * 0.66} ${width * 0.66} ${height * 0.66} ${width * 0.72} ${height * 0.92}Z" fill="hsl(${hueB} 70% 54% / .82)"/>`
    : `<path d="M0 ${height * 0.72} C${width * 0.25} ${height * 0.48} ${width * 0.42} ${height * 0.88} ${width} ${height * 0.55} L${width} ${height} L0 ${height}Z" fill="hsl(${hueB} 74% 48% / .42)"/><circle cx="${width * 0.72}" cy="${height * 0.3}" r="${height * 0.18}" fill="hsl(${hueC} 86% 62% / .52)"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="hsl(${hueA} 78% 14%)"/><stop offset=".52" stop-color="hsl(${hueB} 84% 32%)"/><stop offset="1" stop-color="hsl(${hueC} 88% 58%)"/></linearGradient><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".78" numOctaves="3"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .18"/></feComponentTransfer></filter><radialGradient id="spot" cx="38%" cy="24%" r="70%"><stop stop-color="hsl(0 0% 100% / .35)"/><stop offset=".42" stop-color="hsl(0 0% 100% / .08)"/><stop offset="1" stop-color="hsl(0 0% 0% / .34)"/></radialGradient></defs><rect width="${width}" height="${height}" fill="url(#g)"/>${subject}<rect width="${width}" height="${height}" fill="url(#spot)"/><rect width="${width}" height="${height}" filter="url(#grain)"/><path d="M${width * 0.08} ${height * 0.16}H${width * 0.92}" stroke="hsl(0 0% 100% / .28)" stroke-width="2"/><path d="M${width * 0.08} ${height * 0.84}H${width * 0.92}" stroke="hsl(0 0% 0% / .35)" stroke-width="2"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, count = 4, aspectRatio = "16:9" } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI gateway not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aspectHint =
      aspectRatio === "1:1"
        ? "square 1:1 composition"
        : aspectRatio === "9:16"
        ? "vertical 9:16 portrait composition"
        : "horizontal 16:9 cinematic composition";

    const styledPrompt = `${prompt}. Ultra-detailed, professional, ${aspectHint}, premium quality, sharp focus.`;

    // Run up to `count` generations in parallel
    const n = Math.max(1, Math.min(4, Number(count) || 4));
    const tasks = Array.from({ length: n }).map(async () => {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: styledPrompt }],
          modalities: ["image", "text"],
        }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error("AI gateway error", resp.status, text);
        return { error: `gateway_${resp.status}` };
      }

      const data = await resp.json();
      const url = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      return url ? { url } : { error: "no_image" };
    });

    const results = await Promise.all(tasks);
    const images = results.filter((r): r is { url: string } => "url" in r).map((r) => r.url);

    if (images.length === 0) {
      const firstErr = (results[0] as any)?.error || "unknown";
      return new Response(
        JSON.stringify({
          images: Array.from({ length: n }).map((_, i) => createPremiumFallback(prompt, i, aspectRatio)),
          fallback: true,
          detail: firstErr,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ images }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-image error", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
