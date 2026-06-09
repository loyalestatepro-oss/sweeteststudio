// Edge function: generate-music
// Procedurally synthesizes a short WAV loop tuned to the chosen preset/BPM — no external API.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type PresetSpec = {
  bpms: number[];
  scale: number[];           // semitone offsets from root
  root: number;              // MIDI note number for root
  waveform: "sine" | "triangle" | "square" | "saw";
  noise: number;             // 0..1 noise amount
  beatPattern: number[];     // 1 = kick, 0 = silence (16th steps)
  bars: number;              // number of bars
};

const PRESETS: Record<string, PresetSpec> = {
  Pop:          { bpms: [118, 124, 128], scale: [0, 2, 4, 7, 9],     root: 60, waveform: "triangle", noise: 0.18, beatPattern: [1,0,0,0, 1,0,1,0, 1,0,0,0, 1,0,1,0], bars: 2 },
  Cinematic:    { bpms: [60, 72, 80],    scale: [0, 3, 5, 7, 10],    root: 48, waveform: "sine",     noise: 0.06, beatPattern: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0], bars: 2 },
  "Lo-fi":      { bpms: [75, 80, 88],    scale: [0, 3, 5, 7, 10],    root: 55, waveform: "triangle", noise: 0.30, beatPattern: [1,0,0,0, 1,0,0,1, 1,0,0,0, 1,0,1,0], bars: 2 },
  Electronic:   { bpms: [128, 138, 145], scale: [0, 2, 3, 7, 8],     root: 50, waveform: "saw",      noise: 0.12, beatPattern: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0], bars: 2 },
  Acoustic:     { bpms: [96, 104, 110],  scale: [0, 2, 4, 5, 7, 9],  root: 57, waveform: "triangle", noise: 0.10, beatPattern: [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0], bars: 2 },
  "Hip-hop":    { bpms: [90, 96, 100],   scale: [0, 3, 5, 7, 10],    root: 50, waveform: "square",   noise: 0.22, beatPattern: [1,0,0,0, 1,0,1,0, 0,0,0,1, 1,0,1,0], bars: 2 },
};

const SAMPLE_RATE = 22050; // smaller = lighter payload

function midiToFreq(m: number): number {
  return 440 * Math.pow(2, (m - 69) / 12);
}

function osc(t: number, freq: number, wave: PresetSpec["waveform"]): number {
  const phase = 2 * Math.PI * freq * t;
  switch (wave) {
    case "sine":     return Math.sin(phase);
    case "triangle": return (2 / Math.PI) * Math.asin(Math.sin(phase));
    case "square":   return Math.sin(phase) >= 0 ? 1 : -1;
    case "saw":      return 2 * ((freq * t) % 1) - 1;
  }
}

function envelope(n: number, total: number, attack = 0.01, release = 0.25): number {
  const t = n / SAMPLE_RATE;
  const dur = total / SAMPLE_RATE;
  if (t < attack) return t / attack;
  if (t > dur - release) return Math.max(0, (dur - t) / release);
  return 1;
}

function buildTrack(spec: PresetSpec, bpm: number, seedOffset: number): Uint8Array {
  const secsPerBeat = 60 / bpm;
  const beatsPerBar = 4;
  const totalSecs = spec.bars * beatsPerBar * secsPerBeat;
  const totalSamples = Math.floor(totalSecs * SAMPLE_RATE);
  const stepSamples = Math.floor((totalSamples) / (spec.beatPattern.length * spec.bars));
  const audio = new Float32Array(totalSamples);

  // Melody: one note per 16th step, chosen from scale
  for (let bar = 0; bar < spec.bars; bar++) {
    for (let step = 0; step < spec.beatPattern.length; step++) {
      const stepIdx = bar * spec.beatPattern.length + step;
      const noteIdx = (step + bar * 3 + seedOffset) % spec.scale.length;
      const octave = step % 4 === 0 ? 12 : 0;
      const midi = spec.root + spec.scale[noteIdx] + octave;
      const freq = midiToFreq(midi);
      const start = stepIdx * stepSamples;
      const end = Math.min(start + stepSamples, totalSamples);
      const noteLen = end - start;
      const isKick = spec.beatPattern[step] === 1;
      const noteGain = isKick ? 0.35 : 0.18;
      for (let i = 0; i < noteLen; i++) {
        const t = (start + i) / SAMPLE_RATE;
        const env = envelope(i, noteLen);
        let s = osc(t, freq, spec.waveform) * env * noteGain;
        // Kick: low-frequency thump
        if (isKick && i < stepSamples * 0.3) {
          const kickFreq = 70 * Math.exp(-i / (stepSamples * 0.15));
          s += Math.sin(2 * Math.PI * kickFreq * (i / SAMPLE_RATE)) * 0.4 * (1 - i / (stepSamples * 0.3));
        }
        // Noise (hi-hat texture)
        if (spec.noise > 0 && step % 2 === 1) {
          s += (Math.random() * 2 - 1) * spec.noise * 0.15 * env;
        }
        audio[start + i] += s;
      }
    }
  }

  // Pad / sustained chord underneath
  const padFreq = midiToFreq(spec.root - 12);
  const padFreq2 = midiToFreq(spec.root + spec.scale[2] - 12);
  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const padEnv = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.25 * t);
    audio[i] += (Math.sin(2 * Math.PI * padFreq * t) + Math.sin(2 * Math.PI * padFreq2 * t)) * 0.08 * padEnv;
  }

  // Soft clip
  for (let i = 0; i < totalSamples; i++) {
    audio[i] = Math.tanh(audio[i] * 1.4);
  }

  return floatToWav(audio, SAMPLE_RATE);
}

function floatToWav(samples: Float32Array, sampleRate: number): Uint8Array {
  const numSamples = samples.length;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);
  // RIFF header
  writeStr(view, 0, "RIFF");
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(view, 8, "WAVE");
  writeStr(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);            // PCM
  view.setUint16(22, 1, true);            // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(view, 36, "data");
  view.setUint32(40, numSamples * 2, true);
  // PCM samples
  let off = 44;
  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(off, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    off += 2;
  }
  return new Uint8Array(buffer);
}

function writeStr(view: DataView, off: number, s: string) {
  for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
}

function bufToB64(bytes: Uint8Array): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk) as unknown as number[]);
  }
  return btoa(bin);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, preset = "Pop", count = 4 } = await req.json();
    if (!prompt?.trim()) {
      return new Response(JSON.stringify({ error: "Prompt required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const spec = PRESETS[preset] || PRESETS.Pop;
    const n = Math.max(1, Math.min(4, Number(count)));

    const tracks = Array.from({ length: n }, (_, i) => {
      const bpm = spec.bpms[i % spec.bpms.length];
      const wav = buildTrack(spec, bpm, i);
      const secsPerBeat = 60 / bpm;
      const totalSecs = spec.bars * 4 * secsPerBeat;
      const mins = Math.floor(totalSecs / 60);
      const secs = Math.round(totalSecs % 60).toString().padStart(2, "0");
      return {
        id: crypto.randomUUID(),
        title: String(prompt).slice(0, 30),
        audioUrl: `data:audio/wav;base64,${bufToB64(wav)}`,
        duration: `${mins}:${secs}`,
        bpm,
        preset,
      };
    });

    return new Response(JSON.stringify({ tracks }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
