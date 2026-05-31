import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Eye, EyeOff, Sparkles, Mail, ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";

const announceDevCode = (code: string) =>
  toast.message("Verification code sent", {
    description: (
      <span>
        Dev preview — your code is{" "}
        <span className="font-mono text-foreground tracking-widest">{code}</span>
      </span>
    ),
    duration: 12000,
  });

const pasteSanitize = (raw: string) => raw.replace(/\D/g, "").slice(0, 6);

const SignupOtpStep = ({ onBack }: { onBack: () => void }) => {
  const navigate = useNavigate();
  const { pendingSignup, verifySignupOtp, resendSignupOtp, isLoading } = useAuthStore();
  const [code, setCode] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!pendingSignup) return;
    const tick = () =>
      setRemaining(Math.max(0, Math.ceil((pendingSignup.expiresAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [pendingSignup]);

  if (!pendingSignup) return null;

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const attemptsUsed = pendingSignup.attempts ?? 0;
  const attemptsLeft = Math.max(0, 5 - attemptsUsed);
  const isExpired = remaining === 0;
  const hasError = !!otpError;

  const triggerError = (msg: string) => {
    setOtpError(msg);
    setShake((k) => k + 1);
    setTimeout(() => setCode(""), 900);
    setTimeout(() => setOtpError(null), 5000);
  };

  const handleVerify = async (value: string) => {
    if (submittingRef.current || isExpired) return;
    submittingRef.current = true;
    const res = await verifySignupOtp(value);
    submittingRef.current = false;
    if (res.error) {
      triggerError(res.error);
      return;
    }
    toast.success("Email verified — welcome!");
    navigate("/app");
  };

  const handleResend = async () => {
    const res = await resendSignupOtp();
    if (res.error) return toast.error(res.error);
    setOtpError(null);
    setCode("");
    if (res.devCode) announceDevCode(res.devCode);
  };

  const handlePaste: React.ClipboardEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const raw = e.clipboardData.getData("text");
    const sanitized = pasteSanitize(raw);
    if (sanitized.length > 0) {
      setCode(sanitized);
      setOtpError(null);
    }
    if (sanitized.length === 6) {
      handleVerify(sanitized);
    }
  };

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="h-3 w-3" /> Use a different email
      </button>

      <div className="flex flex-col items-center text-center">
        <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow mb-4">
          <Mail className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="font-display text-3xl">Verify your email</h1>
        <p className="text-sm text-muted-foreground mt-2">
          We sent a 6-digit code to{" "}
          <span className="text-foreground font-medium">{pendingSignup.email}</span>
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div
          key={shake}
          onPaste={handlePaste}
          className={cn("flex justify-center", shake > 0 && "animate-shake")}
        >
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(v) => {
              setCode(v);
              setOtpError(null);
            }}
            onComplete={handleVerify}
            disabled={isLoading || isExpired}
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className={cn(
                    hasError && "border-destructive text-destructive",
                    hasError && i === 0 && "border-l-destructive",
                    hasError && i === 5 && "border-r-destructive"
                  )}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {otpError && (
          <div className="flex items-center gap-1.5 text-xs text-destructive animate-fade-in">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{otpError}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="font-mono text-muted-foreground">
          {remaining > 0 ? `Expires in ${mm}:${ss}` : "Code expired"}
        </span>
        <button
          type="button"
          onClick={handleResend}
          disabled={isLoading}
          className="inline-flex items-center gap-1 text-primary-glow hover:underline disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
          Resend code
        </button>
      </div>

      <div className="text-xs text-center text-muted-foreground">
        {attemptsLeft < 5 && attemptsLeft > 0 && (
          <span className="text-destructive">{attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining</span>
        )}
        {attemptsLeft === 0 && (
          <span className="text-destructive">No attempts remaining. Request a new code.</span>
        )}
      </div>

      <Button
        onClick={() => handleVerify(code)}
        disabled={isLoading || code.length !== 6 || isExpired}
        className="w-full bg-gradient-primary text-primary-foreground border-0 shadow-glow h-11"
      >
        {isLoading ? "Verifying…" : "Verify & continue"}
      </Button>
    </div>
  );
};

export const AuthPage = ({ mode }: { mode: "login" | "signup" }) => {
  const navigate = useNavigate();
  const { login, startSignup, isLoading, pendingSignup, cancelSignup } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const showOtp = mode === "signup" && pendingSignup;

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
    if (mode === "login") {
      const res = await login(email, password);
      if (res.error) return toast.error(res.error);
      toast.success("Welcome back!");
      navigate("/app");
      return;
    }
    const res = await startSignup(name, email, password);
    if (res.error) return toast.error(res.error);
    if (res.devCode) announceDevCode(res.devCode);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 bg-nebula">
      <div className="absolute inset-0 grid-bg opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <div className="glass-strong rounded-2xl p-8">
          {showOtp ? (
            <SignupOtpStep onBack={cancelSignup} />
          ) : (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-3xl">
                  {mode === "login" ? "Welcome back" : "Create account"}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {mode === "login"
                    ? "Sign in to your studio workspace."
                    : "Start creating for free — we'll verify your email next."}
                </p>
              </div>

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
                      : "Sending code…"
                    : mode === "login"
                    ? "Sign in"
                    : "Continue"}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
