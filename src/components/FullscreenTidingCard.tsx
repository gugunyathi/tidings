import { Eye, TrendingUp, BookOpen, Play, Bookmark, ChevronUp, ChevronDown, Volume2 } from "lucide-react";
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

  return (
    <div className="h-full w-full flex flex-col relative">
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
          onClick={handleViewDetails}
          className="p-3 rounded-full bg-secondary/60 backdrop-blur-sm text-secondary-foreground"
        >
          <Play className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className={`text-2xl font-display font-bold ${probabilityColor}`}>{tiding.probability}%</div>
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
        <div className="border border-primary/20 rounded-lg p-3 bg-secondary/30 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] text-primary uppercase tracking-widest font-display">Prediction Market</span>
          </div>
          <p className="text-xs text-foreground mb-2 font-body">{tiding.marketQuestion}</p>
          <div className="flex gap-2">
            <button className="flex-1 bg-probability-high/20 text-probability-high rounded-md py-1.5 text-xs font-semibold">
              Yes {tiding.marketOdds.yes}%
            </button>
            <button className="flex-1 bg-probability-low/20 text-probability-low rounded-md py-1.5 text-xs font-semibold">
              No {tiding.marketOdds.no}%
            </button>
          </div>
        </div>

        {/* Timestamp */}
        <p className="text-[10px] text-muted-foreground font-body">{tiding.timestamp}</p>
      </div>
    </div>
  );
};

export default FullscreenTidingCard;
