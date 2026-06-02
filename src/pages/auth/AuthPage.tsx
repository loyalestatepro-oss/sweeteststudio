import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Sparkles, ArrowLeft, Mail, KeyRound, CheckCircle2 } from "lucide-react";

type Screen = "login" | "signup" | "forgot" | "verify" | "reset_done";

export const AuthPage = ({ mode }: { mode: "login" | "signup" }) => {
  const navigate = useNavigate();
  const { login, signup, requestPasswordReset, confirmPasswordReset, isLoading } = useAuthStore();

  const [screen, setScreen] = useState<Screen>(mode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [resetEmail, setResetEmail] = useState("");

  const clearErrors = () => setFieldErrors({});

  const validate = (fields: Record<string, { val: string; rules: Array<(v: string) => string | null> }>) => {
    const errs: Record<string, string> = {};
    for (const [key, { val, rules }] of Object.entries(fields)) {
      for (const rule of rules) {
        const err = rule(val);
        if (err) { errs[key] = err; break; }
      }
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const req = (msg: string) => (v: string) => !v.trim() ? msg : null;
  const emailRule = (v: string) => !/\S+@\S+\.\S+/.test(v) ? "Enter a valid email." : null;
  const pwRule = (v: string) => v.length < 8 ? "At least 8 characters." : null;

  // ─── LOGIN ────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate({
      email: { val: email, rules: [req("Email required."), emailRule] },
      password: { val: password, rules: [req("Password required.")] },
    })) return;
    const result = await login(email, password);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Welcome back!");
    navigate("/app");
  };

  // ─── SIGNUP ───────────────────────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate({
      name: { val: name, rules: [req("Name required.")] },
      email: { val: email, rules: [req("Email required."), emailRule] },
      password: { val: password, rules: [req("Password required."), pwRule] },
    })) return;
    const result = await signup(name, email, password);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Account created! Welcome to Sweetest Studio 🎉", {
      description: "Check your email for a welcome message.",
    });
    navigate("/app");
  };

  // ─── FORGOT PASSWORD ──────────────────────────────────────────────────────
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate({ email: { val: email, rules: [req("Email required."), emailRule] } })) return;
    const result = await requestPasswordReset(email);
    setResetEmail(email);
    if (result.simulated) {
      toast.info("Reset code sent!", {
        description: "EmailJS not configured — check console for the code, or configure EmailJS in src/lib/emailService.ts",
      });
    } else {
      toast.success("Reset code sent to your email!");
    }
    setScreen("verify");
  };

  // ─── VERIFY CODE + NEW PASSWORD ───────────────────────────────────────────
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate({
      code: { val: code, rules: [req("Code required."), (v) => v.length !== 6 ? "Enter the 6-digit code." : null] },
      newPassword: { val: newPassword, rules: [req("New password required."), pwRule] },
    })) return;
    const result = await confirmPasswordReset(resetEmail, code, newPassword);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Password updated! You can now sign in.");
    setScreen("reset_done");
  };

  // ─── RESET DONE ───────────────────────────────────────────────────────────
  if (screen === "reset_done") {
    return (
      <AuthShell>
        <div className="text-center space-y-4 py-6">
          <CheckCircle2 className="h-14 w-14 text-accent mx-auto" />
          <h1 className="font-display text-3xl">Password updated!</h1>
          <p className="text-sm text-muted-foreground">Your password has been reset successfully.</p>
          <Button
            className="w-full bg-gradient-primary text-primary-foreground border-0 shadow-glow h-11 mt-4"
            onClick={() => { setScreen("login"); setPassword(""); setCode(""); setNewPassword(""); }}
          >
            Sign in now
          </Button>
        </div>
      </AuthShell>
    );
  }

  // ─── VERIFY SCREEN ────────────────────────────────────────────────────────
  if (screen === "verify") {
    return (
      <AuthShell>
        <div className="space-y-6">
          <button onClick={() => setScreen("forgot")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          <div>
            <h1 className="font-display text-3xl">Check your email</h1>
            <p className="text-sm text-muted-foreground mt-1">
              We sent a 6-digit code to <span className="text-foreground font-medium">{resetEmail}</span>
            </p>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted-foreground flex gap-3">
            <Mail className="h-4 w-4 text-primary-glow mt-0.5 shrink-0" />
            <span>If EmailJS isn't configured, open your browser console (F12 → Console) to see the reset code.</span>
          </div>
          <form onSubmit={handleVerify} className="space-y-4" noValidate>
            <div>
              <Label className="text-xs">6-digit code</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                className="mt-1.5 bg-muted/30 border-border/60 font-mono text-center text-lg tracking-[0.4em]"
                autoFocus
                maxLength={6}
              />
              {fieldErrors.code && <p className="text-xs text-destructive mt-1">{fieldErrors.code}</p>}
            </div>
            <div>
              <Label className="text-xs">New password</Label>
              <div className="relative mt-1.5">
                <Input
                  type={showPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="8+ characters"
                  className="bg-muted/30 border-border/60 pr-10"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.newPassword && <p className="text-xs text-destructive mt-1">{fieldErrors.newPassword}</p>}
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-gradient-primary text-primary-foreground border-0 shadow-glow h-11">
              {isLoading ? "Updating…" : "Set new password"}
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground">
            Didn't get a code?{" "}
            <button className="text-primary-glow hover:underline" onClick={() => { setScreen("forgot"); clearErrors(); }}>
              Resend
            </button>
          </p>
        </div>
      </AuthShell>
    );
  }

  // ─── FORGOT SCREEN ────────────────────────────────────────────────────────
  if (screen === "forgot") {
    return (
      <AuthShell>
        <div className="space-y-6">
          <button onClick={() => { setScreen("login"); clearErrors(); }} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </button>
          <div>
            <KeyRound className="h-8 w-8 text-primary-glow mb-3" />
            <h1 className="font-display text-3xl">Forgot password?</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter your email and we'll send a reset code.</p>
          </div>
          <form onSubmit={handleForgot} className="space-y-4" noValidate>
            <div>
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.ai"
                className="mt-1.5 bg-muted/30 border-border/60"
                autoFocus
              />
              {fieldErrors.email && <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>}
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-gradient-primary text-primary-foreground border-0 shadow-glow h-11">
              {isLoading ? "Sending…" : "Send reset code"}
            </Button>
          </form>
        </div>
      </AuthShell>
    );
  }

  // ─── LOGIN SCREEN ─────────────────────────────────────────────────────────
  if (screen === "login") {
    return (
      <AuthShell>
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-3xl">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your studio workspace.</p>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted-foreground space-y-0.5">
            <p className="text-primary-glow font-medium flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> Demo credentials</p>
            <p>Email: <span className="font-mono text-foreground">demo@studio.ai</span></p>
            <p>Password: <span className="font-mono text-foreground">demo1234</span></p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <Label className="text-xs">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.ai" className="mt-1.5 bg-muted/30 border-border/60" autoComplete="email" />
              {fieldErrors.email && <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>}
            </div>
            <div>
              <Label className="text-xs">Password</Label>
              <div className="relative mt-1.5">
                <Input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="bg-muted/30 border-border/60 pr-10" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-xs text-destructive mt-1">{fieldErrors.password}</p>}
            </div>
            <div className="flex justify-end">
              <button type="button" className="text-xs text-primary-glow hover:underline" onClick={() => { setScreen("forgot"); clearErrors(); }}>
                Forgot password?
              </button>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-gradient-primary text-primary-foreground border-0 shadow-glow h-11">
              {isLoading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary-glow hover:underline">Sign up free</Link>
          </p>
        </div>
      </AuthShell>
    );
  }

  // ─── SIGNUP SCREEN ────────────────────────────────────────────────────────
  return (
    <AuthShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl">Create account</h1>
          <p className="text-sm text-muted-foreground mt-1">Start creating for free — no card needed.</p>
        </div>
        <form onSubmit={handleSignup} className="space-y-4" noValidate>
          <div>
            <Label className="text-xs">Full name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-1.5 bg-muted/30 border-border/60" autoComplete="name" autoFocus />
            {fieldErrors.name && <p className="text-xs text-destructive mt-1">{fieldErrors.name}</p>}
          </div>
          <div>
            <Label className="text-xs">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.ai" className="mt-1.5 bg-muted/30 border-border/60" autoComplete="email" />
            {fieldErrors.email && <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>}
          </div>
          <div>
            <Label className="text-xs">Password</Label>
            <div className="relative mt-1.5">
              <Input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8+ characters" className="bg-muted/30 border-border/60 pr-10" autoComplete="new-password" />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-xs text-destructive mt-1">{fieldErrors.password}</p>}
          </div>
          <Button type="submit" disabled={isLoading} className="w-full bg-gradient-primary text-primary-foreground border-0 shadow-glow h-11">
            {isLoading ? "Creating account…" : "Create account — it's free"}
          </Button>
          <p className="text-[11px] text-center text-muted-foreground">By signing up you agree to our Terms & Privacy Policy.</p>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-glow hover:underline">Sign in</Link>
        </p>
      </div>
    </AuthShell>
  );
};

// ─── SHARED WRAPPER ─────────────────────────────────────────────────────────
const AuthShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 bg-nebula">
    <div className="absolute inset-0 grid-bg opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
    <div className="relative w-full max-w-md">
      <div className="flex justify-center mb-8">
        <Logo />
      </div>
      <div className="glass-strong rounded-2xl p-8">
        {children}
      </div>
    </div>
  </div>
);

export default AuthPage;
