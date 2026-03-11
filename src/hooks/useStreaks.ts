import { useState, useEffect, useCallback } from "react";

export interface StreakData {
  current: number;
  longest: number;
  lastVisit: string;
  todayViewed: number;
  todayReacted: number;
  seerLevel: number;
  seerTitle: string;
  xp: number;
  xpToNext: number;
}

const SEER_TITLES = [
  "Initiate",        // 0
  "Acolyte",         // 1
  "Diviner",         // 2
  "Augur",           // 3
  "Seer",            // 4
  "Prophet",         // 5
  "Oracle",          // 6
  "Archon",          // 7
  "Ascended",        // 8
  "Eternal Witness", // 9
];

function getSeerTitle(level: number): string {
  return SEER_TITLES[Math.min(level, SEER_TITLES.length - 1)];
}

function getXpToNext(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level));
}

const STORAGE_KEY = "tidings_streak";

function loadStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    current: 0,
    longest: 0,
    lastVisit: "",
    todayViewed: 0,
    todayReacted: 0,
    seerLevel: 0,
    seerTitle: "Initiate",
    xp: 0,
    xpToNext: 100,
  };
}

function saveStreak(data: StreakData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function useStreaks() {
  const [streak, setStreak] = useState<StreakData>(loadStreak);

  // Check-in on mount
  useEffect(() => {
    const today = todayStr();
    setStreak((prev) => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      let next = { ...prev };
      if (prev.lastVisit === today) {
        // Already visited today
        return prev;
      } else if (prev.lastVisit === yesterdayStr) {
        // Consecutive day
        next.current = prev.current + 1;
        next.longest = Math.max(next.current, prev.longest);
      } else {
        // Streak broken or first visit
        next.current = 1;
      }
      next.lastVisit = today;
      next.todayViewed = 0;
      next.todayReacted = 0;
      saveStreak(next);
      return next;
    });
  }, []);

  const addXp = useCallback((amount: number) => {
    setStreak((prev) => {
      let next = { ...prev, xp: prev.xp + amount };
      // Level up check
      while (next.xp >= next.xpToNext) {
        next.xp -= next.xpToNext;
        next.seerLevel += 1;
        next.seerTitle = getSeerTitle(next.seerLevel);
        next.xpToNext = getXpToNext(next.seerLevel);
      }
      saveStreak(next);
      return next;
    });
  }, []);

  const recordView = useCallback(() => {
    setStreak((prev) => {
      const next = { ...prev, todayViewed: prev.todayViewed + 1 };
      saveStreak(next);
      return next;
    });
    addXp(5); // 5 XP per view
  }, [addXp]);

  const recordReaction = useCallback(() => {
    setStreak((prev) => {
      const next = { ...prev, todayReacted: prev.todayReacted + 1 };
      saveStreak(next);
      return next;
    });
    addXp(15); // 15 XP per reaction
  }, [addXp]);

  const recordGenerate = useCallback(() => {
    addXp(50); // 50 XP per Oracle consultation
  }, [addXp]);

  return { streak, addXp, recordView, recordReaction, recordGenerate };
}
