import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export const Logo = ({ className = "" }: { className?: string }) => (
  <Link to="/" className={`flex items-center gap-2 group ${className}`}>
    <div className="relative h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
      <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
      <div className="absolute inset-0 rounded-lg bg-gradient-primary blur-md opacity-50 -z-10" />
    </div>
    <span className="font-display text-xl tracking-tight">
      Nebula<span className="text-aurora">Studio</span>
    </span>
  </Link>
);
