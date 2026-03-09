import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User, LogOut, Bookmark, Settings, LogIn } from "lucide-react";

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <button
        onClick={() => navigate("/auth")}
        className="flex items-center gap-2 bg-gradient-gold text-primary-foreground px-4 py-2 rounded-full text-xs font-semibold shadow-glow hover:opacity-90 transition-opacity font-body"
      >
        <LogIn className="w-3.5 h-3.5" />
        Sign In
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigate("/saved")}
        className="p-2 rounded-full bg-secondary hover:bg-muted text-secondary-foreground transition-colors"
        title="Saved Tidings"
      >
        <Bookmark className="w-4 h-4" />
      </button>
      <button
        onClick={() => navigate("/settings")}
        className="p-2 rounded-full bg-secondary hover:bg-muted text-secondary-foreground transition-colors"
        title="Settings"
      >
        <Settings className="w-4 h-4" />
      </button>
      <button
        onClick={async () => {
          await signOut();
          navigate("/");
        }}
        className="p-2 rounded-full bg-secondary hover:bg-muted text-secondary-foreground transition-colors"
        title="Sign Out"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
};

export default UserMenu;
