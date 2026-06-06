// Edge function: generate-video
// Streams progress (SSE) while generating cinematic keyframes via Lovable AI Gateway.
// Returns 3 keyframes that the client composites into an animated video preview.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const encoder = new TextEncoder();
const sse = (event: string, data: unknown) =>
  encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

function hashPrompt(input: string): number {
  return input.split("").reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
}

function createFallbackFrame(prompt: string, index: number, aspectRatio: string): string {
  const seed = Math.abs(hashPrompt(`${prompt}-${index}-${aspectRatio}`));
  const hueA = (seed + index * 47) % 360;
  const hueB = (hueA + 72 + index * 13) % 360;
  const hueC = (hueA + 148) % 360;
  const width = aspectRatio === "1:1" ? 1024 : 1536;
  const height = aspectRatio === "9:16" ? 1536 : aspectRatio === "1:1" ? 1024 : 864;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="hsl(${hueA} 78% 10%)"/><stop offset=".55" stop-color="hsl(${hueB} 80% 28%)"/><stop offset="1" stop-color="hsl(${hueC} 90% 58%)"/></linearGradient><radialGradient id="sun" cx="${34 + index * 18}%" cy="${28 + index * 8}%" r="32%"><stop stop-color="hsl(42 100% 72% / .85)"/><stop offset=".35" stop-color="hsl(${hueC} 92% 58% / .32)"/><stop offset="1" stop-color="hsl(0 0% 0% / 0)"/></radialGradient><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="3"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .16"/></feComponentTransfer></filter></defs><rect width="${width}" height="${height}" fill="url(#g)"/><rect width="${width}" height="${height}" fill="url(#sun)"/><path d="M0 ${height * (0.68 - index * 0.04)} C${width * .22} ${height * .48} ${width * .48} ${height * .88} ${width} ${height * (0.5 + index * 0.05)} L${width} ${height} L0 ${height}Z" fill="hsl(${hueB} 82% 42% / .42)"/><path d="M${width * .08} ${height * .5}H${width * .92}" stroke="hsl(0 0% 100% / .32)" stroke-width="2"/><rect width="${width}" height="${height}" filter="url(#grain)"/><rect y="0" width="${width}" height="${height * .09}" fill="hsl(0 0% 0% / .55)"/><rect y="${height * .91}" width="${width}" height="${height * .09}" fill="hsl(0 0% 0% / .55)"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function generateKeyframe(apiKey: string, prompt: string): Promise<string | null> {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image",
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
    }),
  });
  if (!resp.ok) {
    console.error("keyframe error", resp.status, await resp.text());
    return null;
  }
  const data = await resp.json();
  return data?.choices?.[0]?.message?.images?.[0]?.image_url?.url ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, aspectRatio = "16:9" } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Prompt required" }), {
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
      aspectRatio === "9:16" ? "vertical 9:16 portrait"
      : aspectRatio === "1:1" ? "square 1:1"
      : "cinematic 16:9 widescreen";

    const beats = [
      `${prompt}. Opening shot — wide establishing frame, ${aspectHint}, cinematic lighting, 35mm film, shallow depth of field, dramatic composition.`,
      `${prompt}. Mid shot — pushed in closer, dynamic motion blur, anamorphic lens flare, ${aspectHint}, color graded, atmospheric.`,
      `${prompt}. Hero close-up — intimate detail, shallow focus, golden hour, ${aspectHint}, editorial cinematography, award-winning still.`,
    ];

    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(sse("stage", { step: 0, total: 5, label: "Analyzing prompt…" }));
          await new Promise((r) => setTimeout(r, 400));

          controller.enqueue(sse("stage", { step: 1, total: 5, label: "Storyboarding shots…" }));
          await new Promise((r) => setTimeout(r, 400));

          const frames: string[] = [];
          for (let i = 0; i < beats.length; i++) {
            controller.enqueue(
              sse("stage", { step: 2 + i, total: 5, label: `Rendering keyframe ${i + 1}/3…` })
            );
            const url = await generateKeyframe(apiKey, beats[i]);
            if (url) {
              frames.push(url);
              controller.enqueue(sse("frame", { index: i, url }));
            } else {
              controller.enqueue(sse("warn", { index: i, message: "Frame failed" }));
            }
          }

          while (frames.length < beats.length) {
            const fallback = createFallbackFrame(prompt, frames.length, aspectRatio);
            frames.push(fallback);
            controller.enqueue(sse("frame", { index: frames.length - 1, url: fallback, fallback: true }));
          }
          controller.enqueue(sse("done", { frames }));
          controller.close();
        } catch (err) {
          controller.enqueue(sse("error", { message: (err as Error).message }));
          controller.close();
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
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
