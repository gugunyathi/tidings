import { Eye, TrendingUp, BookOpen, Play, Bookmark } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedTidings } from "@/hooks/useSavedTidings";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ProbabilityBadgeProps {
  score: number;
}

const ProbabilityBadge = ({ score }: ProbabilityBadgeProps) => {
  const color = score >= 70 ? "bg-probability-high" : score >= 40 ? "bg-probability-mid" : "bg-probability-low";
  return (
    <div className={`${color} px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 text-primary-foreground`}>
      <Eye className="w-3 h-3" />
      {score}% Prophetic Probability
    </div>
  );
};

interface TidingSource {
  tradition: string;
  reference: string;
}

export interface TidingData {
  id: string;
  title: string;
  summary: string;
  image: string;
  videoUrl?: string; // Add optional video support
  probability: number;
  sources: TidingSource[];
  marketQuestion: string;
  marketOdds: { yes: number; no: number };
  timestamp: string;
  category: string;
}

interface TidingCardProps {
  tiding: TidingData;
}

const TidingCard = ({ tiding }: TidingCardProps) => {
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSavedTidings();
  const navigate = useNavigate();
  const saved = isSaved(tiding.id);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate("/auth");
      return;
    }
    const success = await toggleSave(tiding.id);
    if (success) {
      toast.success(saved ? "Tiding removed from saved" : "Tiding saved");
    }
  };

  return (
    <article className="bg-gradient-card rounded-lg overflow-hidden border border-border hover:shadow-glow transition-all duration-500 group">
      {/* Vision Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={tiding.image}
          alt={tiding.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        
        {/* Play button overlay */}
        <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center shadow-glow">
            <Play className="w-7 h-7 text-primary-foreground ml-1" />
          </div>
        </button>

        {/* Category tag */}
        <div className="absolute top-4 left-4">
          <span className="bg-secondary/80 backdrop-blur-sm text-secondary-foreground text-xs font-medium px-3 py-1 rounded-full uppercase tracking-widest">
            {tiding.category}
          </span>
        </div>

        {/* Probability badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <ProbabilityBadge score={tiding.probability} />
        </div>
      </div>

      {/* The Scroll - Text Content */}
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground leading-tight">
            {tiding.title}
          </h2>
          <button
            onClick={handleSave}
            className={`flex-shrink-0 p-2 rounded-full transition-colors ${
              saved ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
            }`}
            title={saved ? "Unsave" : "Save"}
          >
            <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
          </button>
        </div>
        
        <p className="text-muted-foreground text-sm leading-relaxed font-body">
          {tiding.summary}
        </p>

        {/* Oracle Sources */}
        <div className="border border-border rounded-md p-4 space-y-2 bg-secondary/30">
          <div className="flex items-center gap-2 text-oracle font-display text-xs uppercase tracking-widest">
            <BookOpen className="w-3.5 h-3.5" />
            Oracle Sources
          </div>
          <div className="flex flex-wrap gap-2">
            {tiding.sources.map((source, i) => (
              <span key={i} className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">
                {source.tradition}: {source.reference}
              </span>
            ))}
          </div>
        </div>

        {/* Prediction Market Widget */}
        <div className="border border-primary/20 rounded-md p-4 space-y-3 animate-shimmer">
          <div className="flex items-center gap-2 text-primary font-display text-xs uppercase tracking-widest">
            <TrendingUp className="w-3.5 h-3.5" />
            Prediction Market
          </div>
          <p className="text-sm text-foreground font-medium">{tiding.marketQuestion}</p>
          <div className="flex gap-2">
            <button className="flex-1 bg-probability-high/15 hover:bg-probability-high/25 border border-probability-high/30 text-probability-high rounded-md py-2 text-sm font-semibold transition-colors">
              Yes {tiding.marketOdds.yes}%
            </button>
            <button className="flex-1 bg-probability-low/15 hover:bg-probability-low/25 border border-probability-low/30 text-probability-low rounded-md py-2 text-sm font-semibold transition-colors">
              No {tiding.marketOdds.no}%
            </button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground pt-2">
          {tiding.timestamp}
        </div>
      </div>
    </article>
  );
};

export default TidingCard;
