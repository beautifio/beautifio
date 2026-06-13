"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Circle, PenLine, Trophy } from "lucide-react";
import type { CalendarDayInfo } from "@/lib/journey-queries";

interface CalendarHistoryProps {
  userId: string;
}

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const DAY_HEADERS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function CalendarHistory({ userId }: CalendarHistoryProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [days, setDays] = useState<CalendarDayInfo[]>([]);
  const [selectedDay, setSelectedDay] = useState<CalendarDayInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMonth = useCallback(async () => {
    setLoading(true);
    try {
      const { getMonthActivities } = await import("@/lib/journey-queries");
      const data = await getMonthActivities(userId, year, month);
      setDays(data);
      setSelectedDay(null);
    } catch (e) {
      console.error("Failed to load month activities", e);
    } finally {
      setLoading(false);
    }
  }, [userId, year, month]);

  useEffect(() => {
    loadMonth();
  }, [loadMonth]);

  const grid = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const offset = (firstDay + 6) % 7;
    const cells: (CalendarDayInfo | null)[] = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (const day of days) cells.push(day);
    return cells;
  }, [days, year, month]);

  const prevMonth = () => {
    if (month === 1) { setYear(year - 1); setMonth(12); }
    else { setMonth(month - 1); }
  };

  const nextMonth = () => {
    if (month === 12) { setYear(year + 1); setMonth(1); }
    else { setMonth(month + 1); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-xl cursor-pointer">
          <ChevronLeft size={18} className="text-text-secondary" />
        </button>
        <p className="text-sm font-bold text-text-primary">
          {MONTHS[month - 1]} {year}
        </p>
        <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-xl cursor-pointer">
          <ChevronRight size={18} className="text-text-secondary" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-sm text-text-secondary">Memuat...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1">
            {DAY_HEADERS.map((h) => (
              <div key={h} className="text-center text-[10px] font-semibold text-text-secondary/50 py-1">
                {h}
              </div>
            ))}
            {grid.map((cell, i) => (
              <button
                key={i}
                onClick={() => cell && setSelectedDay(cell)}
                disabled={!cell}
                className={`relative aspect-square rounded-xl text-xs flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer
                  ${!cell ? "invisible" : ""}
                  ${selectedDay?.date === cell?.date ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"}
                  ${cell?.date === new Date().toISOString().split("T")[0] ? "ring-1 ring-primary/30" : ""}
                `}
              >
                <span className="text-xs font-medium text-text-primary">
                  {cell ? parseInt(cell.date.split("-")[2]) : ""}
                </span>
                <div className="flex gap-0.5">
                  {cell?.has_activity && <Circle size={5} className="text-primary fill-primary" />}
                  {cell?.has_reflection && <PenLine size={5} className="text-accent" />}
                  {cell?.has_milestone && <Trophy size={5} className="text-success" />}
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 text-[10px] text-text-secondary/60 pt-1">
            <span className="flex items-center gap-1"><Circle size={6} className="text-primary fill-primary" /> Aktivitas</span>
            <span className="flex items-center gap-1"><PenLine size={6} className="text-accent" /> Refleksi</span>
            <span className="flex items-center gap-1"><Trophy size={6} className="text-success" /> Pencapaian</span>
          </div>

          {selectedDay && <DayDetail day={selectedDay} userId={userId} />}
        </>
      )}
    </div>
  );
}

function DayDetail({ day, userId }: { day: CalendarDayInfo; userId: string }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [reflections, setReflections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { supabase } = await import("@/lib/supabase/client");
        if (!supabase) return;
        const [actRes, refRes] = await Promise.all([
          supabase.from("daily_activities").select("title, is_completed").eq("user_id", userId).eq("activity_date", day.date),
          supabase.from("daily_reflections").select("learned, grateful, improve, mood").eq("user_id", userId).eq("date", day.date),
        ]);
        setActivities(actRes.data || []);
        setReflections(refRes.data || []);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, [day, userId]);

  return (
    <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
      <p className="text-sm font-bold text-text-primary">{formatDate(day.date)}</p>
      {loading ? (
        <p className="text-xs text-text-secondary">Memuat...</p>
      ) : (
        <>
          {activities.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-text-secondary/60 mb-1">Aktivitas</p>
              <div className="space-y-1">
                {activities.map((a, i) => (
                  <p key={i} className="text-xs text-text-primary flex items-center gap-1.5">
                    <span className={a.is_completed ? "text-success" : "text-text-secondary/30"}>
                      {a.is_completed ? "✓" : "○"}
                    </span>
                    {a.title}
                  </p>
                ))}
              </div>
            </div>
          )}
          {reflections.map((r, i) => (
            <div key={i} className="pt-2 border-t border-border">
              <p className="text-[11px] font-semibold text-text-secondary/60 mb-1">Refleksi</p>
              {r.learned && <p className="text-xs text-text-primary leading-relaxed">{r.learned}</p>}
              {r.grateful && <p className="text-xs text-text-secondary mt-1">Bersyukur: {r.grateful}</p>}
              {r.mood && <p className="text-xs text-text-secondary/40 mt-1">Suasana hati: {r.mood}</p>}
            </div>
          ))}
          {activities.length === 0 && reflections.length === 0 && (
            <p className="text-xs text-text-secondary/50">Tidak ada catatan untuk hari ini.</p>
          )}
        </>
      )}
    </div>
  );
}
