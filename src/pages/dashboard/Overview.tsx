import { Link } from "react-router-dom";
import { Video, Image as ImageIcon, Music, Mic, UserSquare2, TrendingUp, Clock, Sparkles, ArrowRight } from "lucide-react";

const studios = [
  { to: "/app/video", icon: Video, name: "Video", color: "from-violet-500 to-fuchsia-500", desc: "Cinematic generation" },
  { to: "/app/image", icon: ImageIcon, name: "Image", color: "from-cyan-400 to-blue-500", desc: "Concept art & design" },
  { to: "/app/music", icon: Music, name: "Music", color: "from-amber-400 to-pink-500", desc: "Tracks & scoring" },
  { to: "/app/voice", icon: Mic, name: "Voice", color: "from-emerald-400 to-cyan-500", desc: "Cloning & dubbing" },
  { to: "/app/avatar", icon: UserSquare2, name: "Avatar", color: "from-rose-400 to-violet-500", desc: "Photoreal speakers" },
];

const recent = [
  { name: "Aurora Campaign — Hero film", type: "Video", time: "12m ago", status: "Rendering", gradient: "from-violet-500 to-fuchsia-500" },
  { name: "Q1 product shots", type: "Image", time: "1h ago", status: "Complete", gradient: "from-cyan-400 to-blue-500" },
  { name: "Brand anthem track", type: "Music", time: "3h ago", status: "Complete", gradient: "from-amber-400 to-pink-500" },
  { name: "ES/FR dubbing pass", type: "Voice", time: "Yesterday", status: "Complete", gradient: "from-emerald-400 to-cyan-500" },
];

const Overview = () => (
  <div className="p-8 space-y-10 max-w-7xl">
    {/* Hero greeting */}
    <div className="relative overflow-hidden rounded-2xl glass-strong p-8 bg-nebula">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-primary-glow mb-2">Good evening, Studio</p>
          <h1 className="font-display text-4xl md:text-5xl">Ready to make something <em className="text-aurora not-italic">extraordinary?</em></h1>
        </div>
        <Link to="/app/video" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-primary text-primary-foreground shadow-glow text-sm">
          <Sparkles className="h-4 w-4" /> Start with Video
        </Link>
      </div>
    </div>

    {/* Stats */}
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Renders this month", value: "248", delta: "+34%", icon: TrendingUp },
        { label: "Active projects", value: "12", delta: "3 due", icon: Clock },
        { label: "Credits used", value: "860 / 3,000", delta: "29%", icon: Sparkles },
        { label: "Team members", value: "6", delta: "2 online", icon: UserSquare2 },
      ].map((s) => (
        <div key={s.label} className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <s.icon className="h-4 w-4 text-primary-glow" />
            <span className="text-xs font-mono text-accent">{s.delta}</span>
          </div>
          <p className="font-display text-3xl">{s.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
        </div>
      ))}
    </div>

    {/* Studios grid */}
    <div>
      <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">Jump into a studio</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {studios.map((s) => (
          <Link
            key={s.name}
            to={s.to}
            className="group glass rounded-xl p-5 hover:border-primary/40 transition-all hover:-translate-y-1 overflow-hidden relative"
          >
            <div className={`absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br ${s.color} blur-2xl opacity-30 group-hover:opacity-60 transition`} />
            <div className={`relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${s.color} mb-3`}>
              <s.icon className="h-5 w-5 text-white" />
            </div>
            <p className="font-medium">{s.name}</p>
            <p className="text-xs text-muted-foreground">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>

    {/* Recent activity */}
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground">Recent activity</h2>
        <Link to="/app/projects" className="text-xs text-primary-glow inline-flex items-center gap-1 hover:underline">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="glass rounded-xl divide-y divide-border/40">
        {recent.map((r) => (
          <div key={r.name} className="flex items-center gap-4 p-4 hover:bg-muted/20 transition cursor-pointer">
            <div className={`h-10 w-14 rounded-lg bg-gradient-to-br ${r.gradient} flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.type} · {r.time}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full ${
              r.status === "Rendering"
                ? "bg-primary/15 text-primary-glow border border-primary/30"
                : "bg-accent/15 text-accent border border-accent/30"
            }`}>
              {r.status === "Rendering" && <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-glow mr-1.5 animate-pulse" />}
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Overview;
