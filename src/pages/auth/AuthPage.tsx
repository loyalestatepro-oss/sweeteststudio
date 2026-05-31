import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Sparkles } from "lucide-react";

export const AuthPage = ({ mode }: { mode: "login" | "signup" }) => {
  const navigate = useNavigate();
  const { login, signup, isLoading } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (mode === "signup" && !name.trim()) errs.name = "Name is required.";
    if (!email.trim()) errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email.";
    if (!password) errs.password = "Password is required.";
    else if (mode === "signup" && password.length < 8) errs.password = "At least 8 characters.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const result =
      mode === "login"
        ? await login(email, password)
        : await signup(name, email, password);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(mode === "login" ? "Welcome back!" : "Account created!");
      navigate("/app");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 bg-nebula">
      <div className="absolute inset-0 grid-bg opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <div className="glass-strong rounded-2xl p-8 space-y-6">
          <div>
            <h1 className="font-display text-3xl">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "login"
                ? "Sign in to your studio workspace."
                : "Start creating for free — no card needed."}
            </p>
          </div>

          {/* Demo hint */}
          {mode === "login" && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted-foreground space-y-0.5">
              <p className="text-primary-glow font-medium flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Demo credentials
              </p>
              <p>Email: <span className="font-mono text-foreground">demo@studio.ai</span></p>
              <p>Password: <span className="font-mono text-foreground">demo1234</span></p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === "signup" && (
              <div>
                <Label className="text-xs">Full name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1.5 bg-muted/30 border-border/60"
                  autoComplete="name"
                />
                {fieldErrors.name && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.name}</p>
                )}
              </div>
            )}
            <div>
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.ai"
                className="mt-1.5 bg-muted/30 border-border/60"
                autoComplete="email"
              />
              {fieldErrors.email && (
                <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>
              )}
            </div>
            <div>
              <Label className="text-xs">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "8+ characters" : "Your password"}
                  className="bg-muted/30 border-border/60 pr-10"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-destructive mt-1">{fieldErrors.password}</p>
              )}
            </div>
            {mode === "login" && (
              <div className="flex justify-end">
                <button type="button" className="text-xs text-primary-glow hover:underline">
                  Forgot password?
                </button>
              </div>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-primary text-primary-foreground border-0 shadow-glow h-11"
            >
              {isLoading
                ? mode === "login"
                  ? "Signing in…"
                  : "Creating account…"
                : mode === "login"
                ? "Sign in"
                : "Create account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary-glow hover:underline">
                  Sign up free
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link to="/login" className="text-primary-glow hover:underline">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
