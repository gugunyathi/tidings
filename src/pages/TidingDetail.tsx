import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, TrendingUp, BookOpen, Play, Pause, Volume2, ScrollText, BrainCircuit, Link2, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";
import { TIDINGS_DATA } from "@/data/tidings";

const TidingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeScriptStep, setActiveScriptStep] = useState(0);

  const tiding = TIDINGS_DATA.find((t) => t.id === id);

  if (!tiding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground font-body">Tiding not found.</p>
          <button onClick={() => navigate("/")} className="text-primary underline font-body text-sm">
            Return to feed
          </button>
        </div>
      </div>
    );
  }

  const probabilityColor =
    tiding.probability >= 70 ? "text-probability-high" : tiding.probability >= 40 ? "text-probability-mid" : "text-probability-low";
  const probabilityBg =
    tiding.probability >= 70 ? "bg-probability-high" : tiding.probability >= 40 ? "bg-probability-mid" : "bg-probability-low";

  const relatedTidings = TIDINGS_DATA.filter((t) => tiding.relatedTidings.includes(t.id));

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      let step = 0;
      const interval = setInterval(() => {
        step++;
        if (step >= tiding.videoScript.length) {
          clearInterval(interval);
          setIsPlaying(false);
          setActiveScriptStep(0);
        } else {
          setActiveScriptStep(step);
        }
      }, 3300);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Full-screen Vision Player */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden">
        <img
          src={tiding.image}
          alt={tiding.title}
          className={`w-full h-full object-cover transition-transform duration-[3000ms] ${isPlaying ? "scale-110" : "scale-100"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />

        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-secondary/60 backdrop-blur-md text-secondary-foreground px-4 py-2 rounded-full text-sm font-body hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Feed
        </button>

        {/* Play controls */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <button
            onClick={handlePlayToggle}
            className="w-20 h-20 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center shadow-glow hover:bg-primary transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-primary-foreground" />
            ) : (
              <Play className="w-8 h-8 text-primary-foreground ml-1" />
            )}
          </button>
        </div>

        {/* Voiceover text during playback */}
        {isPlaying && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 max-w-2xl text-center">
            <p className="font-display text-lg md:text-xl text-foreground bg-background/60 backdrop-blur-md px-6 py-4 rounded-lg animate-pulse-glow">
              "{tiding.videoScript[activeScriptStep]?.audio.split("Voiceover: '")[1]?.replace("'", "") || tiding.voiceover}"
            </p>
          </div>
        )}

        {/* Bottom overlay info */}
        {!isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-10">
            <div className="max-w-3xl mx-auto space-y-3">
              <span className="bg-secondary/60 backdrop-blur-sm text-secondary-foreground text-xs font-medium px-3 py-1 rounded-full uppercase tracking-widest">
                {tiding.category}
              </span>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight">
                {tiding.title}
              </h1>
              <div className="flex items-center gap-4">
                <div className={`${probabilityBg} px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 text-primary-foreground`}>
                  <Eye className="w-3 h-3" />
                  {tiding.probability}% Prophetic Probability
                </div>
                <span className="text-xs text-muted-foreground">{tiding.timestamp}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        {/* Summary */}
        <p className="text-foreground text-lg leading-relaxed font-body">
          {tiding.summary}
        </p>

        {/* Video Script Timeline */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-display text-sm uppercase tracking-widest">
            <Volume2 className="w-4 h-4" />
            The Vision — 10s Script
          </div>
          <div className="space-y-3">
            {tiding.videoScript.map((step, i) => (
              <div
                key={i}
                className={`border rounded-lg p-5 transition-all duration-500 ${
                  isPlaying && activeScriptStep === i
                    ? "border-primary bg-primary/5 shadow-glow"
                    : "border-border bg-gradient-card"
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded flex-shrink-0 mt-0.5">
                    {step.time}
                  </span>
                  <div className="space-y-2">
                    <p className="text-sm text-foreground font-body">{step.visual}</p>
                    <p className="text-xs text-muted-foreground italic font-body">{step.audio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Expanded Oracle Analysis */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-oracle font-display text-sm uppercase tracking-widest">
            <BrainCircuit className="w-4 h-4" />
            Expanded Oracle Analysis
          </div>
          <div className="border border-oracle/20 rounded-lg p-6 bg-oracle/5 shadow-oracle">
            {tiding.expandedAnalysis.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-sm text-foreground/90 leading-relaxed font-body mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {/* Probability Gauge */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-foreground font-display text-sm uppercase tracking-widest">
            <Eye className="w-4 h-4" />
            Prophetic Probability Assessment
          </div>
          <div className="border border-border rounded-lg p-6 bg-gradient-card">
            <div className="flex items-end justify-between mb-3">
              <span className={`text-5xl font-display font-bold ${probabilityColor}`}>{tiding.probability}%</span>
              <span className="text-xs text-muted-foreground font-body">Multi-tradition consensus score</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${probabilityBg} rounded-full transition-all duration-1000`}
                style={{ width: `${tiding.probability}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-3 font-body">
              Based on textual correlation, geographic overlap, prediction market sentiment, and historical pattern analysis.
            </p>
          </div>
        </section>

        {/* Deep Source Citations */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-prophecy font-display text-sm uppercase tracking-widest">
            <ScrollText className="w-4 h-4" />
            Source Citations
          </div>
          <div className="space-y-4">
            {tiding.deepSources.map((source, i) => (
              <div key={i} className="border border-border rounded-lg p-6 bg-gradient-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-primary font-body">
                    {source.tradition}
                  </span>
                  <span className="text-xs text-muted-foreground font-body">{source.reference}</span>
                </div>
                <blockquote className="border-l-2 border-prophecy/50 pl-4 py-1">
                  <p className="text-sm text-foreground italic font-body leading-relaxed">
                    "{source.excerpt}"
                  </p>
                </blockquote>
                <p className="text-xs text-muted-foreground leading-relaxed font-body">
                  {source.context}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Prediction Market */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-display text-sm uppercase tracking-widest">
            <TrendingUp className="w-4 h-4" />
            Prediction Market
          </div>
          <div className="border border-primary/20 rounded-lg p-6 bg-gradient-card animate-shimmer">
            <p className="text-foreground font-medium mb-4 font-body">{tiding.marketQuestion}</p>
            <div className="flex gap-3">
              <button className="flex-1 bg-probability-high/15 hover:bg-probability-high/25 border border-probability-high/30 text-probability-high rounded-lg py-3 text-sm font-semibold transition-colors font-body">
                Yes {tiding.marketOdds.yes}%
              </button>
              <button className="flex-1 bg-probability-low/15 hover:bg-probability-low/25 border border-probability-low/30 text-probability-low rounded-lg py-3 text-sm font-semibold transition-colors font-body">
                No {tiding.marketOdds.no}%
              </button>
            </div>
          </div>
        </section>

        {/* Agent Notes */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground font-display text-sm uppercase tracking-widest">
            <BookOpen className="w-4 h-4" />
            Agent Intelligence Notes
          </div>
          <div className="space-y-2">
            {tiding.agentNotes.map((note, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-md bg-muted/30 border border-border">
                <span className="text-xs text-primary font-mono mt-0.5">#{i + 1}</span>
                <p className="text-xs text-muted-foreground leading-relaxed font-body">{note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Tidings */}
        {relatedTidings.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-foreground font-display text-sm uppercase tracking-widest">
              <Link2 className="w-4 h-4" />
              Related Tidings
            </div>
            <div className="grid gap-3">
              {relatedTidings.map((related) => (
                <button
                  key={related.id}
                  onClick={() => navigate(`/tiding/${related.id}`)}
                  className="flex items-center gap-4 p-4 rounded-lg bg-gradient-card border border-border hover:border-primary/30 hover:shadow-glow transition-all duration-300 text-left group"
                >
                  <img
                    src={related.image}
                    alt={related.title}
                    className="w-20 h-14 rounded object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-sm font-semibold text-foreground truncate">
                      {related.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{related.timestamp}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default TidingDetail;
