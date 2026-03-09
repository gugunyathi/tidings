import { Filter, Scroll, Swords, Globe, BookOpen } from "lucide-react";
import { useState } from "react";

const categories = [
  { id: "all", label: "All Tidings", icon: Scroll },
  { id: "geopolitical", label: "Geopolitical", icon: Globe },
  { id: "eschatological", label: "Eschatological", icon: BookOpen },
  { id: "conflict", label: "Conflict", icon: Swords },
];

interface CategoryFilterProps {
  onFilterChange: (category: string) => void;
}

const CategoryFilter = ({ onFilterChange }: CategoryFilterProps) => {
  const [active, setActive] = useState("all");

  const handleClick = (id: string) => {
    setActive(id);
    onFilterChange(id);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = active === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => handleClick(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium tracking-wide whitespace-nowrap transition-all duration-300 ${
              isActive
                ? "bg-primary text-primary-foreground shadow-glow"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
