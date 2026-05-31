import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

const Settings = () => {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [workspace, setWorkspace] = useState("My Workspace");
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState([true, true, false, false]);

  const togglePref = (i: number) => {
    setPrefs((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
    toast.success("Preference updated.");
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Name cannot be empty."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { toast.error("Enter a valid email."); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    updateUser({ name, email, initials });
    setSaving(false);
    toast.success("Changes saved!");
  };

  const prefItems = [
    { label: "Cinematic theme animations", desc: "Use rich motion across the workspace." },
    { label: "Auto-enhance prompts", desc: "Improve prompts with AI before rendering." },
    { label: "Email render notifications", desc: "Get pinged when renders finish." },
    { label: "Beta features", desc: "Try unreleased models and tools." },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Workspace preferences.</p>
      </div>

      <section className="glass rounded-2xl p-6 space-y-5">
        <h2 className="font-medium">Profile</h2>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 ring-2 ring-primary/30">
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-lg">
              {user?.initials ?? "?"}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            size="sm"
            className="glass border-border/60"
            onClick={() => toast.info("Avatar upload — coming soon.")}
          >
            Change avatar
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Display name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 bg-muted/30 border-border/60"
            />
          </div>
          <div>
            <Label className="text-xs">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 bg-muted/30 border-border/60"
            />
          </div>
        </div>
      </section>

      <section className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-medium">Preferences</h2>
        {prefItems.map((p, i) => (
          <div key={p.label} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
            <div>
              <p className="text-sm">{p.label}</p>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
            </div>
            <Switch
              checked={prefs[i]}
              onCheckedChange={() => togglePref(i)}
            />
          </div>
        ))}
      </section>

      <section className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-medium">Workspace</h2>
        <div>
          <Label className="text-xs">Workspace name</Label>
          <Input
            value={workspace}
            onChange={(e) => setWorkspace(e.target.value)}
            className="mt-1.5 bg-muted/30 border-border/60"
          />
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-primary text-primary-foreground border-0"
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Settings;
