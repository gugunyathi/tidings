import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBaseAccount } from "@/hooks/useBaseAccount";
import { SignInWithBaseButton } from "@base-org/account-ui/react";
import { LogOut, Bookmark, Settings, LogIn } from "lucide-react";

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
      <div className={baseLoading ? "opacity-60 pointer-events-none" : ""}>
        <SignInWithBaseButton
          colorScheme="dark"
          onClick={baseSignIn}
        />
      </div>
      <button
        onClick={() => navigate("/auth")}
        className="flex items-center gap-2 bg-gradient-gold text-primary-foreground px-4 py-2 rounded-full text-xs font-semibold shadow-glow hover:opacity-90 transition-opacity font-body"
      >
        <LogIn className="w-3.5 h-3.5" />
        Email
      </button>
    </div>
  );
};

export default UserMenu;
