import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Video, Image as ImageIcon, Music, Mic, UserSquare2, Wand2, Layers, Zap,
  ArrowRight, Sparkles, Play, Check, Users, Globe, Lock, Cpu, Star,
} from "lucide-react";

const studios = [
  { icon: Video, name: "Video", tag: "Veo · Sora · Kling", desc: "Cinematic generation, in/out painting, lip-sync, and motion brushes.", color: "from-violet-500 to-fuchsia-500" },
  { icon: ImageIcon, name: "Image", tag: "Midjourney class", desc: "Concept art, product mockups, reference-driven styles, infinite canvas.", color: "from-cyan-400 to-blue-500" },
  { icon: Music, name: "Music", tag: "Suno · Udio", desc: "Royalty-free tracks, stem separation, mood-driven scoring.", color: "from-amber-400 to-pink-500" },
  { icon: Mic, name: "Voice", tag: "ElevenLabs class", desc: "Hyper-real voice cloning, multilingual dubbing, emotion controls.", color: "from-emerald-400 to-cyan-500" },
  { icon: UserSquare2, name: "Avatar", tag: "HeyGen class", desc: "Photoreal talking avatars, brand spokespeople, instant translation.", color: "from-rose-400 to-violet-500" },
  { icon: Wand2, name: "Magic Edit", tag: "All studios", desc: "Universal AI editor — extend, restyle, retouch in seconds.", color: "from-gold to-amber-400" },
];

const logos = ["Runway", "Pixar", "Vogue", "MIT", "A24", "Nike", "Netflix", "Apple"];

const features = [
  { icon: Layers, title: "Multi-model orchestration", desc: "Route prompts across 40+ models with a unified canvas. Stop juggling tabs." },
  { icon: Cpu, title: "GPU-backed render farm", desc: "Sub-30s 1080p clips. Burst-render entire campaigns in parallel." },
  { icon: Users, title: "Real-time collaboration", desc: "Live cursors, comments, branching versions. Built like Figma." },
  { icon: Globe, title: "Global delivery & CDN", desc: "Export to 4K, social presets, white-labeled brand kits." },
  { icon: Lock, title: "Enterprise-grade trust", desc: "SOC2, SSO, audit logs, custom data residency, indemnification." },
  { icon: Zap, title: "Workflow automation", desc: "Templates, batch jobs, API access, Zapier & webhooks." },
];

const testimonials = [
  { quote: "Replaced three subscriptions and a contractor. Our campaign velocity tripled.", author: "Amelia Ngata", role: "Creative Director, Lumen Agency" },
  { quote: "The render quality is genuinely indistinguishable from our hand-edited shoots.", author: "Daichi Mori", role: "Founder, Polaris Films" },
  { quote: "Nebula is the first AI tool that feels designed by people who actually ship work.", author: "Priya Sharma", role: "Head of Content, Vogue Digital" },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-clip">
      <SiteNav />

      {/* HERO */}
      <section className="relative pt-28 sm:pt-40 pb-20 sm:pb-32 bg-nebula noise">
        <div className="absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8"
          >
            <Badge variant="outline" className="glass border-primary/30 text-foreground/90 px-4 py-1.5 rounded-full">
              <Sparkles className="h-3 w-3 mr-2 text-primary-glow" />
              <span className="text-[10px] sm:text-xs tracking-wider">INTRODUCING NEBULA STUDIO · v1.0</span>
            </Badge>

            <h1 className="font-display text-4xl sm:text-6xl md:text-8xl leading-[0.95]">
              The creative <em className="text-aurora not-italic">operating system</em><br />
              for AI-native studios.
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Generate cinematic video, image, music, voice, and avatars in one premium workspace.
              Built for the creators, agencies and brands defining what comes next.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
              <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 border-0 shadow-glow rounded-full h-12 px-6">
                <Link to="/app">Start creating — it's free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button variant="outline" size="lg" className="glass rounded-full h-12 px-6 border-border/60">
                <Play className="mr-2 h-4 w-4 text-primary-glow" /> Watch the film
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 sm:pt-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-accent" /> No credit card</span>
              <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-accent" /> 200 free credits</span>
              <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-accent" /> Cancel anytime</span>
            </div>
          </motion.div>

          {/* Hero preview card */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative mt-20 mx-auto max-w-6xl"
          >
            <div className="absolute -inset-4 bg-gradient-primary opacity-30 blur-3xl rounded-3xl" />
            <div className="relative glass-strong rounded-2xl overflow-hidden shadow-elegant">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border/60">
                <span className="h-3 w-3 rounded-full bg-destructive/70" />
                <span className="h-3 w-3 rounded-full bg-gold/70" />
                <span className="h-3 w-3 rounded-full bg-accent/70" />
                <span className="ml-4 font-mono text-xs text-muted-foreground">nebula.studio / project / aurora-campaign</span>
              </div>
              <div className="grid md:grid-cols-[220px_1fr_280px] min-h-[320px] md:min-h-[460px]">
                <div className="border-r border-border/60 p-4 space-y-1 bg-card/40">
                  {["Video", "Image", "Music", "Voice", "Avatar"].map((s, i) => (
                    <div key={s} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${i === 0 ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-muted/40"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-primary animate-pulse-glow" : "bg-muted-foreground/40"}`} />
                      {s} Studio
                    </div>
                  ))}
                </div>
                <div className="p-6 relative overflow-hidden">
                  <div className="grid grid-cols-2 gap-3 h-full">
                    {[0,1,2,3].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + i * 0.15 }}
                        className="relative rounded-xl overflow-hidden bg-gradient-to-br aspect-video"
                        style={{ background: `linear-gradient(${135 + i * 40}deg, hsl(${260 + i * 30} 80% 55%), hsl(${190 + i * 20} 90% 50%))` }}
                      >
                        <div className="absolute inset-0 noise" />
                        <div className="absolute bottom-2 left-3 text-xs font-mono text-white/80">v{i + 1}.{i}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="border-l border-border/60 p-4 space-y-3 bg-card/40">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Prompt</p>
                  <p className="text-sm leading-relaxed">A neon-drenched skyline at dusk, anamorphic lens, drifting fog, slow dolly forward, 35mm grain.</p>
                  <div className="space-y-2 pt-3">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Model</p>
                    <div className="glass rounded-lg px-3 py-2 text-sm font-mono">nebula-cinematic-1080</div>
                  </div>
                  <div className="pt-3 space-y-2">
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Duration</span><span>8s</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Aspect</span><span>21:9</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Seed</span><span className="font-mono">7740291</span></div>
                  </div>
                  <Button className="w-full bg-gradient-primary text-primary-foreground border-0 mt-4">Render · 12 credits</Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* LOGOS */}
      <section className="py-12 border-y border-border/40">
        <div className="container">
          <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-8">Trusted by storytellers at</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4 opacity-60">
            {logos.map((l) => (
              <span key={l} className="font-display text-2xl text-muted-foreground hover:text-foreground transition">{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* STUDIOS */}
      <section id="studios" className="py-20 sm:py-32 relative">
        <div className="container">
          <div className="max-w-2xl mb-10 sm:mb-16">
            <p className="text-xs uppercase tracking-widest text-primary-glow mb-3">Six studios, one canvas</p>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl leading-tight">
              Every modality. <em className="text-aurora not-italic">Zero context-switching.</em>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studios.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group relative glass rounded-2xl p-6 hover:border-primary/40 transition-all hover:-translate-y-1 cursor-pointer overflow-hidden"
              >
                <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${s.color} blur-2xl opacity-30 group-hover:opacity-60 transition`} />
                <div className={`relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} mb-5`}>
                  <s.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-baseline justify-between mb-1">
                  <h3 className="font-display text-2xl">{s.name}</h3>
                  <span className="text-xs font-mono text-muted-foreground">{s.tag}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                <div className="mt-5 flex items-center text-sm text-primary-glow opacity-0 group-hover:opacity-100 transition">
                  Open studio <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 sm:py-32 bg-nebula relative">
        <div className="container relative">
          <div className="max-w-2xl mb-10 sm:mb-16">
            <p className="text-xs uppercase tracking-widest text-accent mb-3">Built for production</p>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl leading-tight">
              The infrastructure your <em className="text-aurora not-italic">studio deserves.</em>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/40 rounded-2xl overflow-hidden">
            {features.map((f) => (
              <div key={f.title} className="bg-background p-8 hover:bg-card transition-colors">
                <f.icon className="h-7 w-7 text-primary-glow mb-4" strokeWidth={1.5} />
                <h3 className="text-lg font-medium mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="templates" className="py-20 sm:py-32">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <p className="text-xs uppercase tracking-widest text-gold mb-3">Loved by the best in the world</p>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl leading-tight">
              <em className="text-aurora not-italic">Six-figure</em> campaigns. Shipped from a laptop.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.author} className="glass rounded-2xl p-8 flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {[0,1,2,3,4].map((i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}
                </div>
                <p className="text-lg leading-relaxed mb-6 flex-1">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-medium">{t.author}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-32">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl glass-strong p-8 sm:p-16 text-center">
            <div className="absolute inset-0 bg-aurora opacity-20" />
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="relative space-y-6 max-w-2xl mx-auto">
              <h2 className="font-display text-4xl sm:text-5xl md:text-7xl leading-[0.95]">
                Your next masterpiece <em className="text-aurora not-italic">starts tonight.</em>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">Join 80,000+ creators already shipping with Nebula.</p>
              <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 border-0 shadow-glow rounded-full h-12 px-6 mt-4">
                <Link to="/app">Launch the Studio <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Landing;
