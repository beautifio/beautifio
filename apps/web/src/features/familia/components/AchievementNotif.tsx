"use client";

import { useEffect, useState } from "react";
import { X, Trophy, CheckCircle2 } from "lucide-react";

const DISMISSED_KEY = "beautifio_achievement_dismissed";

interface UnlockedAchievement {
  id: string;
  title: string;
  reward_description?: string;
}

export function AchievementNotif() {
  const [notif, setNotif] = useState<UnlockedAchievement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/familia/achievements/progress");
        if (!res.ok) return;
        const { data } = await res.json();

        let dismissed: string[] = [];
        try { dismissed = JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]"); } catch {}

        const newlyCompleted = (data || []).filter(
          (a: any) =>
            a.is_completed &&
            a.completed_at &&
            !dismissed.includes(a.id) &&
            Date.now() - new Date(a.completed_at).getTime() < 7 * 86400000
        );

        if (newlyCompleted.length > 0) {
          setNotif({
            id: newlyCompleted[0].id,
            title: newlyCompleted[0].title,
            reward_description: newlyCompleted[0].reward_description,
          });
        }
      } catch {
        // silent
      }
    })();
  }, []);

  const handleDismiss = () => {
    if (!notif) return;
    const dismissed: string[] = JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
    dismissed.push(notif.id);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
    setNotif(null);
  };

  if (!notif) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="max-w-sm mx-auto p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg">
        <button onClick={handleDismiss} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
          <X className="w-3 h-3" />
        </button>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">Achievement Terbuka!</p>
            <p className="text-xs text-white/80 mt-0.5">{notif.title}</p>
            {notif.reward_description && (
              <p className="text-[10px] text-white/60 mt-1">{notif.reward_description}</p>
            )}
          </div>
          <CheckCircle2 className="w-5 h-5 text-white/60 shrink-0" />
        </div>
      </div>
    </div>
  );
}
