import { Button } from "@/components/ui/button";
import { Check, Sparkles, Download } from "lucide-react";

const invoices = [
  { id: "INV-2026-0312", date: "Mar 1, 2026", amount: "$29.00", status: "Paid" },
  { id: "INV-2026-0211", date: "Feb 1, 2026", amount: "$29.00", status: "Paid" },
  { id: "INV-2026-0110", date: "Jan 1, 2026", amount: "$29.00", status: "Paid" },
];

const Billing = () => (
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
          <p className="font-display text-3xl">Creator</p>
          <p className="text-sm text-muted-foreground mt-1">$29 / month · renews Apr 1</p>
          <Button variant="outline" className="mt-6 glass border-border/60">Upgrade to Studio</Button>
        </div>
      </div>
      <div className="glass rounded-2xl p-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Credits this month</p>
        <p className="font-display text-3xl">2,140 <span className="text-muted-foreground text-lg">/ 3,000</span></p>
        <div className="h-2 rounded-full bg-muted overflow-hidden mt-4">
          <div className="h-full bg-gradient-primary" style={{ width: "71%" }} />
        </div>
        <p className="text-xs text-muted-foreground mt-3">Resets in 12 days · <button className="text-primary-glow hover:underline">Top up</button></p>
      </div>
    </div>

    <div className="glass rounded-2xl p-6">
      <h2 className="font-medium mb-4">Payment method</h2>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-14 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500" />
          <div>
            <p className="text-sm">Visa ending in 4242</p>
            <p className="text-xs text-muted-foreground">Expires 09 / 2028</p>
          </div>
        </div>
        <Button variant="outline" className="glass border-border/60">Update</Button>
      </div>
    </div>

    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
        <h2 className="font-medium">Invoices</h2>
        <span className="text-xs text-muted-foreground">3 of 12</span>
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
              <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Billing;
