import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TIDINGS_DATA } from "@/data/tidings";
import { useSavedTidings } from "@/hooks/useSavedTidings";
import TidingCard from "@/components/TidingCard";
import { ArrowLeft, Bookmark } from "lucide-react";

const SavedTidings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { savedIds } = useSavedTidings();

  if (!user) {
    navigate("/auth");
    return null;
  }

  const savedTidings = TIDINGS_DATA.filter((t) => savedIds.has(t.id));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate("/")} className="p-2 rounded-full bg-secondary hover:bg-muted text-secondary-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-primary" />
            <h1 className="font-display text-2xl font-bold text-foreground">Saved Tidings</h1>
          </div>
        </div>

        {savedTidings.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Bookmark className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground font-body">No saved tidings yet.</p>
            <button onClick={() => navigate("/")} className="text-primary text-sm hover:underline font-body">
              Browse the feed
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {savedTidings.map((tiding) => (
              <div key={tiding.id} onClick={() => navigate(`/tiding/${tiding.id}`)} className="cursor-pointer">
                <TidingCard tiding={tiding} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedTidings;
