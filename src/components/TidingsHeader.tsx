import { Flame, Eye } from "lucide-react";
import UserMenu from "@/components/UserMenu";

const TidingsHeader = () => {
  return (
    <header className="relative py-6 md:py-8 space-y-4">
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse-glow" />
      </div>

      <div className="relative z-10 space-y-4">
        {/* Top bar: logo left, user menu right */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-blue-200 animate-pulse-glow flex-shrink-0 drop-shadow-[0_0_8px_rgba(165,220,255,0.8)]" />
            <h1 className="font-display text-xl md:text-2xl font-bold text-white tracking-wide leading-none drop-shadow-[0_0_10px_rgba(165,220,255,0.8)] animate-pulse-glow">
              TIDINGS
            </h1>
            <Flame className="w-4 h-4 text-blue-200 animate-pulse-glow flex-shrink-0 drop-shadow-[0_0_8px_rgba(165,220,255,0.8)]" />
          </div>
          <UserMenu />
        </div>

        <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto font-body leading-relaxed text-center">
          Where ancient prophecy meets modern events. A multi-faith lens on the patterns shaping our world.
        </p>

        {/* Global indicators */}
        <div className="flex items-center justify-center gap-6 pt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Eye className="w-3.5 h-3.5 text-primary" />
            <span className="font-body">Global Tension Index: <span className="text-accent font-semibold">74</span></span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-body">Active Tidings: <span className="text-primary font-semibold">12</span></span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TidingsHeader;
