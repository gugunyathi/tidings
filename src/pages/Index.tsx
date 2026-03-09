import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TidingsHeader from "@/components/TidingsHeader";
import TidingCard from "@/components/TidingCard";
import CategoryFilter from "@/components/CategoryFilter";
import { TIDINGS_DATA } from "@/data/tidings";

const Index = () => {
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const filtered = filter === "all" ? TIDINGS_DATA : TIDINGS_DATA.filter((t) => t.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <TidingsHeader />
        <div className="mb-6">
          <CategoryFilter onFilterChange={setFilter} />
        </div>
        <div className="space-y-6">
          {filtered.map((tiding) => (
            <div key={tiding.id} onClick={() => navigate(`/tiding/${tiding.id}`)} className="cursor-pointer">
              <TidingCard tiding={tiding} />
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground font-body">
            No tidings found for this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
