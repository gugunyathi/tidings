import { Eye, TrendingUp, BookOpen, Play, Bookmark, ChevronUp, ChevronDown, Volume2, Share2, Coins } from "lucide-react";
import sdk from '@farcaster/miniapp-sdk';
import { useAuth } from "@/contexts/AuthContext";
import { useSavedTidings } from "@/hooks/useSavedTidings";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { TidingData } from "@/components/TidingCard";

interface FullscreenTidingCardProps {
  tiding: TidingData & { voiceover?: string; headline?: string; videoUrl?: string };
  index: number;
  total: number;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
}

const FullscreenTidingCard = ({ tiding, index, total, onNavigateUp, onNavigateDown }: FullscreenTidingCardProps) => {
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSavedTidings();
  const navigate = useNavigate();
  const saved = isSaved(tiding.id);

  const probabilityColor =
    tiding.probability >= 70 ? "text-probability-high" : tiding.probability >= 40 ? "text-probability-mid" : "text-probability-low";
  const probabilityBg =
    tiding.probability >= 70 ? "bg-probability-high" : tiding.probability >= 40 ? "bg-probability-mid" : "bg-probability-low";

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate("/auth");
      return;
    }
    const success = await toggleSave(tiding.id);
    if (success) {
      toast.success(saved ? "Removed from saved" : "Tiding saved");
    }
  };

  const handleViewDetails = () => {
    if (tiding.id.startsWith("ai-")) {
      toast.info("AI-generated tidings don't have detail pages yet");
    } else {
      navigate(`/tiding/${tiding.id}`);
    }
  };

  const handleCast = () => {
    const text = encodeURIComponent(`The Oracle has spoken... ${tiding.title} (${tiding.probability}% Probability)`);
    const embedUrl = encodeURIComponent(`https://tidingsapp.vercel.app/tiding/${tiding.id}`);
    sdk.actions.openUrl(`https://warpcast.com/~/compose?text=${text}&embeds[]=${embedUrl}`);
  };

  const handleBet = (type: 'yes' | 'no') => {
    // Integrate with actual Polymarket/Base Pay
    toast.success(`Redirecting to Base network to buy $5 of ${type.toUpperCase()}`);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleTip = () => {
    toast.success("Initiating 1 USDC Tip to the Oracle via Base...");
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
  };

  const isOmen = tiding.rarity === "Omen" || tiding.probability >= 90;

  return (
    <div className={`h-full w-full flex flex-col relative ${isOmen ? 'animate-omen-glow shadow-[inset_0_0_100px_rgba(220,20,60,0.5)]' : ''}`}>
      {/* Background Image / Video */}
      <div className="absolute inset-0">
        {tiding.videoUrl ? (
          <video
            src={tiding.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={tiding.image}
            alt={tiding.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      </div>

      {/* Navigation hints */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
        {index > 0 && (
          <button onClick={onNavigateUp} className="p-2 rounded-full bg-secondary/60 backdrop-blur-sm text-secondary-foreground">
            <ChevronUp className="w-5 h-5" />
          </button>
        )}
        {index < total - 1 && (
          <button onClick={onNavigateDown} className="p-2 rounded-full bg-secondary/60 backdrop-blur-sm text-secondary-foreground">
            <ChevronDown className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Action buttons */}
      <div className="absolute right-4 bottom-48 z-20 flex flex-col gap-4 items-center">
        <button
          onClick={handleSave}
          className={`p-3 rounded-full backdrop-blur-sm transition-colors ${
            saved ? "bg-primary/80 text-primary-foreground" : "bg-secondary/60 text-secondary-foreground"
          }`}
        >
          <Bookmark className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
        </button>
        <button
          onClick={handleCast}
          className="p-3 rounded-full bg-indigo-500/80 hover:bg-indigo-600 backdrop-blur-sm text-white shadow-[0_0_15px_rgba(99,102,241,0.6)]"
        >
          <Share2 className="w-5 h-5" />
        </button>
        <button
          onClick={handleViewDetails}
          className="p-3 rounded-full bg-secondary/60 backdrop-blur-sm text-secondary-foreground"
        >
          <Play className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className={`text-2xl font-display font-bold ${isOmen ? 'text-red-500 drop-shadow-[0_0_8px_rgba(220,20,60,0.8)] animate-pulse' : probabilityColor}`}>{tiding.probability}%</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Probability</div>
        </div>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex-1 flex flex-col justify-end p-6 pb-10 space-y-4">
        {/* Category */}
        <span className={`${probabilityBg} self-start px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-primary-foreground`}>
          {tiding.category}
        </span>

        {/* Title */}
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
          {tiding.title}
        </h1>

        {/* Headline (for AI tidings) */}
        {(tiding as any).headline && (
          <p className="text-sm text-primary font-medium font-body">{(tiding as any).headline}</p>
        )}

        {/* Summary */}
        <p className="text-sm text-foreground/90 leading-relaxed font-body line-clamp-4">
          {tiding.summary}
        </p>

        {/* Voiceover */}
        {(tiding as any).voiceover && (
          <div className="flex items-start gap-2 bg-secondary/40 backdrop-blur-sm rounded-lg p-3">
            <Volume2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-foreground/80 italic font-body">"{(tiding as any).voiceover}"</p>
          </div>
        )}

        {/* Sources */}
        <div className="flex items-center gap-2 flex-wrap">
          <BookOpen className="w-3.5 h-3.5 text-oracle" />
          {tiding.sources.slice(0, 3).map((src, i) => (
            <span key={i} className="text-[10px] bg-muted/50 text-muted-foreground px-2 py-1 rounded-full">
              {src.tradition}
            </span>
          ))}
        </div>

        {/* Market Question */}
        <div className={`border rounded-lg p-3 backdrop-blur-sm ${isOmen ? 'border-red-500/50 bg-red-950/40' : 'border-primary/20 bg-secondary/30'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-3.5 h-3.5 ${isOmen ? 'text-red-400' : 'text-primary'}`} />
              <span className={`text-[10px] uppercase tracking-widest font-display ${isOmen ? 'text-red-400' : 'text-primary'}`}>
                LIVE PREDICTION MARKET
              </span>
            </div>
          </div>
          <p className="text-xs text-foreground mb-3 font-body font-medium">{tiding.marketQuestion}</p>
          <div className="flex gap-2">
            <button 
              onClick={() => handleBet('yes')}
              className="flex-1 bg-probability-high/20 hover:bg-probability-high/40 text-probability-high border border-probability-high/30 rounded-md py-2 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              Buy YES {tiding.marketOdds.yes}%
            </button>
            <button 
              onClick={() => handleBet('no')}
              className="flex-1 bg-probability-low/20 hover:bg-probability-low/40 text-probability-low border border-probability-low/30 rounded-md py-2 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              Buy NO {tiding.marketOdds.no}%
            </button>
          </div>
        </div>

        {/* Tip & Timestamp Row */}
        <div className="flex items-center justify-between mt-2">
          <p className="text-[10px] text-muted-foreground font-body">{tiding.timestamp}</p>
          <button 
            onClick={handleTip}
            className="flex items-center gap-1 text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-1 rounded-full hover:bg-blue-500/30 transition-colors"
          >
            <Coins className="w-3 h-3" />
            Tip 1 USDC
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullscreenTidingCard;
