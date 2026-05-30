import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const Settings = () => (
  <div className="p-4 sm:p-6 lg:p-8 max-w-3xl space-y-8">
    <div>
      <h1 className="font-display text-3xl sm:text-4xl">Settings</h1>
      <p className="text-sm text-muted-foreground mt-1">Workspace preferences.</p>
    </div>

    <section className="glass rounded-2xl p-6 space-y-5">
      <h2 className="font-medium">Profile</h2>
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 ring-2 ring-primary/30">
          <AvatarFallback className="bg-gradient-primary text-primary-foreground">NS</AvatarFallback>
        </Avatar>
        <Button variant="outline" size="sm" className="glass border-border/60">Change avatar</Button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs">Display name</Label>
          <Input defaultValue="Nebula Studio" className="mt-1.5 bg-muted/30 border-border/60" />
        </div>
        <div>
          <Label className="text-xs">Email</Label>
          <Input defaultValue="studio@nebula.ai" className="mt-1.5 bg-muted/30 border-border/60" />
        </div>
      </div>
    </section>

    <section className="glass rounded-2xl p-6 space-y-4">
      <h2 className="font-medium">Preferences</h2>
      {[
        { label: "Cinematic theme animations", desc: "Use rich motion across the workspace." },
        { label: "Auto-enhance prompts", desc: "Improve prompts with AI before rendering." },
        { label: "Email render notifications", desc: "Get pinged when renders finish." },
        { label: "Beta features", desc: "Try unreleased models and tools." },
      ].map((p, i) => (
        <div key={p.label} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
          <div>
            <p className="text-sm">{p.label}</p>
            <p className="text-xs text-muted-foreground">{p.desc}</p>
          </div>
          <Switch defaultChecked={i < 2} />
        </div>
      ))}
    </section>

    <section className="glass rounded-2xl p-6 space-y-4">
      <h2 className="font-medium">Workspace</h2>
      <div>
        <Label className="text-xs">Workspace name</Label>
        <Input defaultValue="Nebula HQ" className="mt-1.5 bg-muted/30 border-border/60" />
      </div>
      <div className="flex justify-end">
        <Button className="bg-gradient-primary text-primary-foreground border-0">Save changes</Button>
      </div>
    </section>
  </div>
);

export default Settings;
