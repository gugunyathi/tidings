import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated successfully!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-display text-2xl font-bold text-foreground">Set New Password</h1>
          <p className="text-sm text-muted-foreground font-body">Enter your new password below.</p>
        </div>
        <form onSubmit={handleReset} className="bg-gradient-card border border-border rounded-lg p-6 space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-muted text-foreground placeholder:text-muted-foreground pl-10 pr-4 py-3 rounded-lg text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gradient-gold text-primary-foreground py-3 rounded-lg text-sm font-semibold shadow-glow disabled:opacity-50 font-body">
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mx-auto font-body">
          <ArrowLeft className="w-3 h-3" /> Back to feed
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
