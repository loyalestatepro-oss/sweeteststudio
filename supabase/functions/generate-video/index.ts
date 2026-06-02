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

          if (frames.length === 0) {
            controller.enqueue(sse("error", { message: "No frames generated" }));
          } else {
            controller.enqueue(sse("done", { frames }));
          }
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
