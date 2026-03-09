import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBaseAccount } from "@/hooks/useBaseAccount";
import { LogOut, Bookmark, Settings, LogIn } from "lucide-react";

// Compact Base sign-in button — same height as Email button, scales on mobile
const BaseSignInBtn = ({ onClick, loading }: { onClick: () => void; loading: boolean }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="flex items-center gap-1.5 bg-[#0052FF] hover:bg-[#0039B3] disabled:opacity-60 text-white px-3 py-2 rounded-full text-xs font-semibold transition-colors font-body whitespace-nowrap"
  >
    {loading ? (
      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
    ) : (
      <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 21 21" fill="none">
        <circle cx="10.5" cy="10.5" r="10.5" fill="white"/>
        <circle cx="10.5" cy="10.5" r="4.5" fill="#0052FF"/>
      </svg>
    )}
    <span className="hidden sm:inline">Sign in with</span>
    <span>Base</span>
  </button>
);

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const { baseUser, loading: baseLoading, signIn: baseSignIn, signOut: baseSignOut } = useBaseAccount();
  const navigate = useNavigate();

  // Signed in via Base Account
  if (baseUser) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-mono bg-secondary px-3 py-1.5 rounded-full">
          {baseUser.address.slice(0, 6)}…{baseUser.address.slice(-4)}
        </span>
        <button
          onClick={baseSignOut}
          className="p-2 rounded-full bg-secondary hover:bg-muted text-secondary-foreground transition-colors"
          title="Disconnect Base Account"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Signed in via Supabase email
  if (user) {
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
  }

  // Not signed in — show both options
  return (
    <div className="flex items-center gap-2">
      <BaseSignInBtn onClick={baseSignIn} loading={baseLoading} />
      <button
        onClick={() => navigate("/auth")}
        className="flex items-center gap-1.5 bg-gradient-gold text-primary-foreground px-3 py-2 rounded-full text-xs font-semibold shadow-glow hover:opacity-90 transition-opacity font-body whitespace-nowrap"
      >
        <LogIn className="w-3 h-3 flex-shrink-0" />
        Email
      </button>
    </div>
  );
};

export default UserMenu;
