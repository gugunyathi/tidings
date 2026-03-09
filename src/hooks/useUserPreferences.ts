import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserPreferences {
  preferred_categories: string[];
  preferred_traditions: string[];
}

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPreferences(null);
      setLoading(false);
      return;
    }

    const fetchPreferences = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("preferred_categories, preferred_traditions")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setPreferences(data);
      }
      setLoading(false);
    };

    fetchPreferences();
  }, [user]);

  return { preferences, loading };
};
