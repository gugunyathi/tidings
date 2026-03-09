import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Bell, Mail, Smartphone, Filter, BookOpen } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["all", "geopolitical", "eschatological", "conflict"];
const TRADITIONS = ["all", "Christianity", "Islam", "Judaism", "Hinduism", "Futurism"];

const UserSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [emailNewTidings, setEmailNewTidings] = useState(true);
  const [emailMarketAlerts, setEmailMarketAlerts] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [preferredCategories, setPreferredCategories] = useState<string[]>(["all"]);
  const [preferredTraditions, setPreferredTraditions] = useState<string[]>(["all"]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      const [{ data: profile }, { data: prefs }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("notification_preferences").select("*").eq("user_id", user.id).single(),
      ]);
      if (profile) setDisplayName(profile.display_name || "");
      if (prefs) {
        setEmailNewTidings(prefs.email_new_tidings);
        setEmailMarketAlerts(prefs.email_market_alerts);
        setPushEnabled(prefs.push_enabled);
        setPreferredCategories(prefs.preferred_categories);
        setPreferredTraditions(prefs.preferred_traditions);
      }
    };
    loadData();
  }, [user]);

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      await Promise.all([
        supabase.from("profiles").update({ display_name: displayName }).eq("user_id", user.id),
        supabase.from("notification_preferences").update({
          email_new_tidings: emailNewTidings,
          email_market_alerts: emailMarketAlerts,
          push_enabled: pushEnabled,
          preferred_categories: preferredCategories,
          preferred_traditions: preferredTraditions,
        }).eq("user_id", user.id),
      ]);
      toast.success("Settings saved.");
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (list: string[], item: string, setter: (v: string[]) => void) => {
    if (item === "all") {
      setter(["all"]);
    } else {
      const filtered = list.filter((i) => i !== "all");
      if (filtered.includes(item)) {
        const next = filtered.filter((i) => i !== item);
        setter(next.length === 0 ? ["all"] : next);
      } else {
        setter([...filtered, item]);
      }
    }
  };

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`w-10 h-6 rounded-full transition-colors relative ${enabled ? "bg-primary" : "bg-muted"}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-foreground transition-transform ${enabled ? "left-5" : "left-1"}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 rounded-full bg-secondary hover:bg-muted text-secondary-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
        </div>

        {/* Profile */}
        <section className="bg-gradient-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="font-display text-sm uppercase tracking-widest text-primary">Profile</h2>
          <div>
            <label className="text-xs text-muted-foreground font-body block mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-muted text-foreground px-4 py-3 rounded-lg text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <p className="text-xs text-muted-foreground font-body">{user.email}</p>
        </section>

        {/* Notifications */}
        <section className="bg-gradient-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h2 className="font-display text-sm uppercase tracking-widest text-primary">Notifications</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-body text-foreground">Email: New Tidings</span>
              </div>
              <Toggle enabled={emailNewTidings} onChange={setEmailNewTidings} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-body text-foreground">Email: Market Alerts</span>
              </div>
              <Toggle enabled={emailMarketAlerts} onChange={setEmailMarketAlerts} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-body text-foreground">Push Notifications</span>
              </div>
              <Toggle enabled={pushEnabled} onChange={setPushEnabled} />
            </div>
          </div>
        </section>

        {/* Feed Preferences */}
        <section className="bg-gradient-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <h2 className="font-display text-sm uppercase tracking-widest text-primary">Feed Preferences</h2>
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-body block mb-2">Preferred Categories</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleItem(preferredCategories, cat, setPreferredCategories)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors font-body ${
                    preferredCategories.includes(cat)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-body block mb-2">Preferred Traditions</label>
            <div className="flex flex-wrap gap-2">
              {TRADITIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleItem(preferredTraditions, t, setPreferredTraditions)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors font-body ${
                    preferredTraditions.includes(t)
                      ? "bg-oracle text-oracle-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </section>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-gradient-gold text-primary-foreground py-3 rounded-lg text-sm font-semibold shadow-glow hover:opacity-90 transition-opacity disabled:opacity-50 font-body"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
};

export default UserSettings;
