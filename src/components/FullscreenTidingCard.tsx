import { useState, useEffect, useRef, useCallback } from "react";
import { Eye, TrendingUp, BookOpen, Bookmark, Share2, Volume2, Flame, Zap, ExternalLink } from "lucide-react";
import sdk from '@farcaster/miniapp-sdk';
import { useAuth } from "@/contexts/AuthContext";
import { useSavedTidings } from "@/hooks/useSavedTidings";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import ParticleEffect from "@/components/ParticleEffect";
import type { TidingData } from "@/components/TidingCard";

interface FullscreenTidingCardProps {
  tiding: TidingData & { voiceover?: string; headline?: string; newsSource?: string; newsUrl?: string; videoUrl?: string; rarity?: string };
  index: number;
  total: number;
  isActive: boolean;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
  onWitness?: () => void;
}

const RARITY_CONFIG = {
  Common: { glow: "", hue: 38, label: "", particleMode: "ambient" as const, count: 8 },
  Rare: { glow: "rarity-rare", hue: 220, label: "RARE TIDING", particleMode: "ambient" as const, count: 15 },
  Epic: { glow: "rarity-epic", hue: 270, label: "EPIC PROPHECY", particleMode: "rain" as const, count: 25 },
  Omen: { glow: "rarity-omen", hue: 0, label: "OMEN", particleMode: "rain" as const, count: 40 },
};

const FullscreenTidingCard = ({
  tiding,
  index,
  total,
  isActive,
  onNavigateUp,
  onNavigateDown,
  onWitness,
}: FullscreenTidingCardProps) => {
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSavedTidings();
  const navigate = useNavigate();
  const saved = isSaved(tiding.id);
  const cardRef = useRef<HTMLDivElement>(null);

  // Animated states
  const [witnessed, setWitnessed] = useState(false);
  const [witnessCount, setWitnessCount] = useState(() => Math.floor(Math.random() * 2000) + 100);
  const [showBurst, setShowBurst] = useState(false);
  const [burstPos, setBurstPos] = useState<{ x: number; y: number } | null>(null);
  const [animatedProb, setAnimatedProb] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [showVoiceover, setShowVoiceover] = useState(false);
  const lastTapRef = useRef(0);

  const rarity = (tiding.rarity as keyof typeof RARITY_CONFIG) || "Common";
  const rarityConf = RARITY_CONFIG[rarity] || RARITY_CONFIG.Common;
  const isOmen = rarity === "Omen" || tiding.probability >= 90;
  const isNew = tiding.id.startsWith("ai-");

  const probabilityColor =
    tiding.probability >= 70 ? "text-probability-high" : tiding.probability >= 40 ? "text-probability-mid" : "text-probability-low";

  // Animated probability counter when card becomes active
  useEffect(() => {
    if (!isActive) {
      setShowContent(false);
      setShowVoiceover(false);
      setAnimatedProb(0);
      return;
    }

    // Stagger content reveal
    const t1 = setTimeout(() => setShowContent(true), 150);
    const t2 = setTimeout(() => setShowVoiceover(true), 600);

    // Count-up probability
    const target = tiding.probability;
    const duration = 1200;
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setAnimatedProb(target);
        clearInterval(interval);
      } else {
        setAnimatedProb(Math.round(current));
      }
    }, duration / steps);

    // Haptic on card enter
    if (navigator.vibrate) navigator.vibrate(15);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(interval);
    };
  }, [isActive, tiding.probability]);

  // Double-tap to witness
  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      // Double tap!
      const rect = cardRef.current?.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0]?.clientX ?? 0 : (e as React.MouseEvent).clientX;
      const clientY = "touches" in e ? e.touches[0]?.clientY ?? 0 : (e as React.MouseEvent).clientY;

      setBurstPos({
        x: rect ? clientX - rect.left : clientX,
        y: rect ? clientY - rect.top : clientY,
      });
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 800);

      if (!witnessed) {
        setWitnessed(true);
        setWitnessCount((c) => c + 1);
        if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
        onWitness?.();
        // Viral prompt — nudge to share after witnessing
        setTimeout(() => {
          toast("Share this prophecy?", {
            description: "Spread the tiding — let others witness.",
            action: {
              label: "Share",
              onClick: () => handleShare({ stopPropagation: () => {} } as React.MouseEvent),
            },
            duration: 4000,
          });
        }, 1200);
      }
    }
    lastTapRef.current = now;
  }, [witnessed, onWitness]);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate("/auth");
      return;
    }
    const success = await toggleSave(tiding.id);
    if (success) {
      if (navigator.vibrate) navigator.vibrate(20);
      toast.success(saved ? "Removed" : "Saved to your scrolls");
    }
  };

  const handleCast = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rarityTag = rarity !== "Common" ? ` [${rarity.toUpperCase()} TIDING]` : "";
    const text = encodeURIComponent(`⚡ The Oracle speaks...${rarityTag}\n\n"${tiding.title}"\n\n${tiding.probability}% Prophetic Probability\n\nThey wrote about this thousands of years ago. 🔮`);
    const embedUrl = encodeURIComponent(`https://tidingsapp.vercel.app/tiding/${tiding.id}`);
    sdk.actions.openUrl(`https://warpcast.com/~/compose?text=${text}&embeds[]=${embedUrl}`);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const rarityTag = rarity !== "Common" ? ` [${rarity.toUpperCase()}]` : "";
    const shareText = `${tiding.probability}%${rarityTag} — "${tiding.title}"\n\n${tiding.summary.slice(0, 120)}...\n\nThey predicted this. See what ancient prophecy says about today's news.`;
    const shareData = {
      title: `TIDINGS: ${tiding.title}`,
      text: shareText,
      url: `https://tidingsapp.vercel.app/tiding/${tiding.id}`,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareText}\n\n${shareData.url}`);
        toast.success("Copied — paste to share the prophecy!");
      }
    } catch {}
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tiding.id.startsWith("ai-")) {
      navigate(`/tiding/${tiding.id}`, { state: { tiding } });
    } else {
      navigate(`/tiding/${tiding.id}`);
    }
  };

  const handleBet = (type: 'yes' | 'no', e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Buying $5 of ${type.toUpperCase()} on Base...`);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  return (
    <div
      ref={cardRef}
      className={`h-full w-full flex flex-col relative overflow-hidden ${rarityConf.glow}`}
      onClick={handleTap}
    >
      {/* Background Image / Video with slow zoom */}
      <div className="absolute inset-0">
        {tiding.videoUrl ? (
          <video
            src={tiding.videoUrl}
            autoPlay={isActive}
            loop
            muted
            playsInline
            className="w-full h-full object-cover animate-slow-zoom"
          />
        ) : (
          <img
            src={tiding.image}
            alt={tiding.title}
            className={`w-full h-full object-cover transition-transform duration-[12000ms] ${isActive ? "scale-[1.08]" : "scale-100"}`}
          />
        )}
        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
        {/* Vignette edges */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)"
        }} />
      </div>

      {/* Ambient particles */}
      {isActive && (
        <ParticleEffect
          mode={rarityConf.particleMode}
          hue={rarityConf.hue}
          count={rarityConf.count}
          active={isActive}
        />
      )}

      {/* Double-tap burst */}
      {showBurst && burstPos && (
        <>
          <ParticleEffect mode="burst" burstOrigin={burstPos} hue={38} count={40} active />
          <div
            className="absolute z-50 pointer-events-none"
            style={{ left: burstPos.x - 30, top: burstPos.y - 30 }}
          >
            <Eye className="w-[60px] h-[60px] text-oracle animate-heart drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]" />
          </div>
        </>
      )}

      {/* Rarity badge (top center) */}
      {rarityConf.label && isActive && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 animate-badge-pop">
          <div className={`
            px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.3em] uppercase
            ${rarity === "Omen" ? "bg-red-600/90 text-white animate-breaking" : ""}
            ${rarity === "Epic" ? "bg-purple-600/90 text-white" : ""}
            ${rarity === "Rare" ? "bg-blue-600/90 text-white" : ""}
            backdrop-blur-sm border border-white/10
          `}>
            {isNew && "BREAKING · "}{rarityConf.label}
          </div>
        </div>
      )}

      {/* Right side action column (TikTok-style) */}
      <div className="absolute right-3 bottom-56 z-20 flex flex-col gap-5 items-center">
        {/* Witness (like) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!witnessed) {
              setWitnessed(true);
              setWitnessCount((c) => c + 1);
              if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
              onWitness?.();
            }
          }}
          className="flex flex-col items-center gap-1"
        >
          <div className={`p-2.5 rounded-full transition-all duration-300 ${
            witnessed
              ? "bg-oracle/90 text-white scale-110"
              : "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
          }`}>
            <Eye className={`w-6 h-6 ${witnessed ? "animate-heart" : ""}`} />
          </div>
          <span className="text-[11px] text-white font-bold font-body">{witnessCount >= 1000 ? `${(witnessCount / 1000).toFixed(1)}k` : witnessCount}</span>
        </button>

        {/* Save */}
        <button onClick={handleSave} className="flex flex-col items-center gap-1">
          <div className={`p-2.5 rounded-full transition-all duration-300 ${
            saved
              ? "bg-primary/90 text-primary-foreground"
              : "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
          }`}>
            <Bookmark className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
          </div>
          <span className="text-[11px] text-white/70 font-body">Save</span>
        </button>

        {/* Share */}
        <button onClick={handleShare} className="flex flex-col items-center gap-1">
          <div className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors">
            <Share2 className="w-5 h-5" />
          </div>
          <span className="text-[11px] text-white/70 font-body">Share</span>
        </button>

        {/* Cast to Farcaster */}
        <button onClick={handleCast} className="flex flex-col items-center gap-1">
          <div className="p-2.5 rounded-full bg-indigo-500/80 hover:bg-indigo-600 backdrop-blur-sm text-white">
            <Zap className="w-5 h-5" />
          </div>
          <span className="text-[11px] text-white/70 font-body">Cast</span>
        </button>

        {/* Probability meter */}
        <div className="flex flex-col items-center">
          <div className={`text-2xl font-display font-bold ${
            isOmen ? 'text-red-400 drop-shadow-[0_0_12px_rgba(220,20,60,0.8)]' : probabilityColor
          } ${animatedProb === tiding.probability ? 'animate-count-pulse' : ''}`}>
            {animatedProb}%
          </div>
          <div className="text-[9px] text-white/50 uppercase tracking-wider font-body">Probability</div>
        </div>
      </div>

      {/* Content overlay — bottom section */}
      <div className={`relative z-10 flex-1 flex flex-col justify-end p-5 pb-8 space-y-3 transition-all duration-700 ${
        showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}>

        {/* Source tag line */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-oracle/80 flex items-center justify-center">
            <Flame className="w-4 h-4 text-white animate-fire" />
          </div>
          <div>
            <p className="text-white text-xs font-semibold font-body">The Oracle</p>
            <p className="text-white/50 text-[10px] font-body">{tiding.timestamp}</p>
          </div>
        </div>

        {/* Category pill */}
        <div className="flex items-center gap-2">
          <span className="bg-white/10 backdrop-blur-sm text-white/90 text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            {tiding.category}
          </span>
          {isNew && (
            <span className="bg-oracle/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider animate-breaking">
              NEW
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className={`font-display text-xl sm:text-2xl font-bold text-white leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] ${
          isActive ? "animate-text-reveal" : ""
        }`} style={{ animationDelay: "0.2s" }}>
          {tiding.title}
        </h1>

        {/* Headline for AI tidings — real news source */}
        {(tiding as any).headline && (
          <div className="animate-text-reveal" style={{ animationDelay: "0.4s" }}>
            <p className="text-sm text-oracle font-medium font-body">
              {(tiding as any).headline}
            </p>
            {(tiding as any).newsSource && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const url = (tiding as any).newsUrl;
                  if (url) window.open(url, "_blank", "noopener");
                }}
                className="inline-flex items-center gap-1 mt-1 text-[10px] text-white/40 font-body hover:text-white/60 transition-colors"
              >
                <ExternalLink className="w-2.5 h-2.5" />
                Source: {(tiding as any).newsSource}
              </button>
            )}
          </div>
        )}

        {/* Summary - truncated */}
        <p className={`text-sm text-white/85 leading-relaxed font-body line-clamp-3 ${
          isActive ? "animate-text-reveal" : ""
        }`} style={{ animationDelay: "0.5s" }}>
          {tiding.summary}
        </p>

        {/* Voiceover quote */}
        {tiding.voiceover && showVoiceover && (
          <div className="flex items-start gap-2 bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10 animate-slide-up">
            <Volume2 className="w-4 h-4 text-oracle flex-shrink-0 mt-0.5 animate-pulse-glow" />
            <p className="text-xs text-white/70 italic font-body line-clamp-2">"{tiding.voiceover}"</p>
          </div>
        )}

        {/* Sources */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <BookOpen className="w-3 h-3 text-oracle/80" />
          {tiding.sources.slice(0, 3).map((src, i) => (
            <span key={i} className="text-[10px] bg-white/8 backdrop-blur-sm text-white/60 px-2 py-0.5 rounded-full border border-white/5">
              {src.tradition}
            </span>
          ))}
        </div>

        {/* Prediction market — compact */}
        <div className={`rounded-xl p-3 backdrop-blur-md border ${
          isOmen ? 'border-red-500/30 bg-red-950/30' : 'border-white/10 bg-white/5'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className={`w-3 h-3 ${isOmen ? 'text-red-400' : 'text-oracle'}`} />
            <span className={`text-[9px] uppercase tracking-[0.2em] font-bold ${
              isOmen ? 'text-red-400' : 'text-oracle'
            }`}>
              Prediction Market
            </span>
          </div>
          <p className="text-[11px] text-white/90 mb-2 font-body font-medium leading-snug">{tiding.marketQuestion}</p>
          <div className="flex gap-2">
            <button
              onClick={(e) => handleBet('yes', e)}
              className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 border border-emerald-500/30 rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95"
            >
              YES {tiding.marketOdds.yes}%
            </button>
            <button
              onClick={(e) => handleBet('no', e)}
              className="flex-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95"
            >
              NO {tiding.marketOdds.no}%
            </button>
          </div>
        </div>

        {/* Tap-to-expand hint */}
        <button
          onClick={handleViewDetails}
          className="text-[10px] text-white/40 font-body text-center hover:text-white/60 transition-colors"
        >
          Tap to read full analysis →
        </button>
      </div>
    </div>
  );
};

export default FullscreenTidingCard;
