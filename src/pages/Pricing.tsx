import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const tiers = [
  {
    name: "Starter",
    price: "Free",
    sub: "For exploring the universe",
    features: ["200 credits/mo", "All 6 studios", "720p exports", "Community templates", "Watermarked"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Creator",
    price: "$29",
    sub: "For solo creators shipping daily",
    features: ["3,000 credits/mo", "4K exports, no watermark", "Premium models", "Brand kits", "Priority render queue", "Commercial license"],
    cta: "Start 7-day trial",
    highlight: true,
  },
  {
    name: "Studio",
    price: "$99",
    sub: "For teams and agencies",
    features: ["12,000 credits/mo", "Up to 10 seats", "Realtime collaboration", "Custom voice/avatar cloning", "API access", "SSO + audit logs"],
    cta: "Start trial",
    highlight: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    sub: "For brands at planetary scale",
    features: ["Unlimited credits", "Private GPU pool", "Custom model training", "Dedicated CSM", "DPA, SOC2, HIPAA", "Indemnification"],
    cta: "Talk to sales",
    highlight: false,
  },
];

const Pricing = () => (
  <div className="min-h-screen bg-background">
    <SiteNav />
    <section className="pt-28 sm:pt-40 pb-16 sm:pb-20 bg-nebula noise">
      <div className="container text-center max-w-3xl mx-auto space-y-6">
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary-glow">
          <Sparkles className="h-3 w-3" /> Pricing
        </span>
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl leading-[0.95]">
          One workspace. <em className="text-aurora not-italic">Every modality.</em>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">Stop paying for six different AI tools. Pay for one that does it all — better.</p>
      </div>
    </section>

    <section className="pb-32">
      <div className="container grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`relative rounded-2xl p-8 flex flex-col ${
              t.highlight
                ? "glass-strong border-primary/40 shadow-glow"
                : "glass"
            }`}
          >
            {t.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs bg-gradient-primary text-primary-foreground">
                Most popular
              </span>
            )}
            <h3 className="font-display text-2xl">{t.name}</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6">{t.sub}</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-display text-5xl">{t.price}</span>
              {t.price !== "Free" && t.price !== "Custom" && <span className="text-muted-foreground text-sm">/mo</span>}
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {t.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm">
                  <Check className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <Button
              asChild
              className={
                t.highlight
                  ? "bg-gradient-primary text-primary-foreground border-0 shadow-glow"
                  : "bg-secondary hover:bg-secondary/80"
              }
            >
              <Link to={t.name === "Enterprise" ? "/pricing" : "/signup"}>{t.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
    </section>

    <SiteFooter />
  </div>
);

export default Pricing;
