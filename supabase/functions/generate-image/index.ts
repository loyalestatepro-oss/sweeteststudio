// Edge function: generate-image
// Uses Lovable AI Gateway to generate real images via google/gemini-2.5-flash-image
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
      const status = firstErr === "gateway_429" ? 429 : firstErr === "gateway_402" ? 402 : 502;
      return new Response(
        JSON.stringify({ error: "Image generation failed", detail: firstErr }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
