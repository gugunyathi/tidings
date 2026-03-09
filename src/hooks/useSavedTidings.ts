import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useSavedTidings = () => {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchSaved = useCallback(async () => {
    if (!user) {
      setSavedIds(new Set());
      return;
    }
    const { data } = await supabase
      .from("saved_tidings")
      .select("tiding_id")
      .eq("user_id", user.id);
    if (data) {
      setSavedIds(new Set(data.map((d) => d.tiding_id)));
    }
  }, [user]);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const toggleSave = async (tidingId: string) => {
    if (!user) return false;
    setLoading(true);
    try {
      if (savedIds.has(tidingId)) {
        await supabase.from("saved_tidings").delete().eq("user_id", user.id).eq("tiding_id", tidingId);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(tidingId);
          return next;
        });
      } else {
        await supabase.from("saved_tidings").insert({ user_id: user.id, tiding_id: tidingId });
        setSavedIds((prev) => new Set(prev).add(tidingId));
      }
      return true;
    } finally {
      setLoading(false);
    }
  };

  const isSaved = (tidingId: string) => savedIds.has(tidingId);

  return { savedIds, toggleSave, isSaved, loading };
};
