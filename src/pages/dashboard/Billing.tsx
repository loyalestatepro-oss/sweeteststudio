import { Button } from "@/components/ui/button";
import { Check, Sparkles, Download, CreditCard } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const invoices = [
  { id: "INV-2026-0312", date: "Mar 1, 2026", amount: "$29.00", status: "Paid" },
  { id: "INV-2026-0211", date: "Feb 1, 2026", amount: "$29.00", status: "Paid" },
  { id: "INV-2026-0110", date: "Jan 1, 2026", amount: "$29.00", status: "Paid" },
];

const plans = [
  { name: "Creator", price: "$29", credits: 3000, desc: "For solo creators" },
  { name: "Studio", price: "$99", credits: 12000, desc: "For teams" },
];

const Billing = () => {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const navigate = useNavigate();
  const creditPct = user ? Math.round((user.credits.used / user.credits.total) * 100) : 0;

  const handleUpgrade = (plan: string, credits: number) => {
    toast.success(`Upgraded to ${plan}!`, { description: "Your credits have been refreshed." });
    updateUser({ plan: plan as any, credits: { used: user?.credits.used ?? 0, total: credits } });
  };

  const handleTopUp = () => {
    toast.success("500 bonus credits added!");
    updateUser({ credits: { used: user?.credits.used ?? 0, total: (user?.credits.total ?? 200) + 500 } });
  };

  const handleDownloadInvoice = (id: string) => {
    toast.success(`Invoice ${id} downloaded.`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl space-y-8">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your plan, credits, and invoices.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-strong rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-aurora opacity-20" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary-glow mb-2">
              <Sparkles className="h-3 w-3" /> Current plan
            </div>
            <p className="font-display text-3xl">{user?.plan ?? "Starter"}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {user?.plan === "Starter" ? "Free" : user?.plan === "Creator" ? "$29 / month · renews Apr 1" : "$99 / month"}
            </p>
            {user?.plan !== "Studio" && (
              <Button
                variant="outline"
                className="mt-6 glass border-border/60"
                onClick={() => handleUpgrade("Studio", 12000)}
              >
                Upgrade to Studio
              </Button>
            )}
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Credits this month</p>
          <p className="font-display text-3xl">
            {user?.credits.used.toLocaleString()}{" "}
            <span className="text-muted-foreground text-lg">/ {user?.credits.total.toLocaleString()}</span>
          </p>
          <div className="h-2 rounded-full bg-muted overflow-hidden mt-4">
            <div
              className={`h-full bg-gradient-primary transition-all ${creditPct > 90 ? "bg-destructive" : ""}`}
              style={{ width: `${creditPct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Resets in 12 days ·{" "}
            <button className="text-primary-glow hover:underline" onClick={handleTopUp}>
              Top up (+500)
            </button>
          </p>
        </div>
      </div>

      {/* Upgrade plans */}
      {user?.plan === "Starter" && (
        <div className="glass rounded-2xl p-6">
          <h2 className="font-medium mb-4">Upgrade your plan</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {plans.map((p) => (
              <div key={p.name} className="glass rounded-xl p-5 border border-border/60 hover:border-primary/40 transition">
                <p className="font-display text-2xl">{p.name}</p>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
                <p className="font-display text-3xl mt-3">{p.price}<span className="text-sm font-sans text-muted-foreground">/mo</span></p>
                <p className="text-xs text-muted-foreground mt-1">{p.credits.toLocaleString()} credits/mo</p>
                <Button
                  className="mt-4 w-full bg-gradient-primary text-primary-foreground border-0"
                  onClick={() => handleUpgrade(p.name, p.credits)}
                >
                  Upgrade to {p.name}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass rounded-2xl p-6">
        <h2 className="font-medium mb-4">Payment method</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-14 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm">Visa ending in 4242</p>
              <p className="text-xs text-muted-foreground">Expires 09 / 2028</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="glass border-border/60"
            onClick={() => toast.info("Payment update — redirecting to billing portal…")}
          >
            Update
          </Button>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
          <h2 className="font-medium">Invoices</h2>
          <span className="text-xs text-muted-foreground">{invoices.length} invoices</span>
        </div>
        <div className="divide-y divide-border/40">
          {invoices.map((i) => (
            <div key={i.id} className="px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-mono truncate">{i.id}</p>
                <p className="text-xs text-muted-foreground">{i.date}</p>
              </div>
              <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                <span className="text-sm">{i.amount}</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-accent">
                  <Check className="h-3 w-3" /> {i.status}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownloadInvoice(i.id)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Billing;
