import { Flame, Eye } from "lucide-react";

const TidingsHeader = () => {
  return (
    <header className="relative py-8 md:py-12 text-center space-y-4">
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse-glow" />
      </div>

      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Flame className="w-6 h-6 text-primary animate-pulse-glow" />
          <h1 className="font-display text-4xl md:text-6xl font-bold text-gradient-gold tracking-wide">
            TIDINGS
          </h1>
          <Flame className="w-6 h-6 text-primary animate-pulse-glow" />
        </div>

        <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto font-body leading-relaxed">
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
