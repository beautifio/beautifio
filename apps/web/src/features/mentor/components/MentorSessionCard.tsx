"use client";

import { Calendar, Clock, Users } from "lucide-react";
import { Badge } from "@beautifio/ui";
import type { MentorSession } from "@beautifio/types";
import { ProtectedAction } from "@/components/ProtectedAction";

export function MentorSessionCard({ session }: { session: MentorSession }) {
  const isUpcoming = session.status === "upcoming";

  return (
    <div className={`p-4 rounded-xl border transition-all ${isUpcoming ? "border-primary/20 bg-primary/[0.02]" : "border-border opacity-70"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-text-primary">{session.title}</h4>
            {isUpcoming && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 leading-none">Baru</Badge>}
          </div>
          <p className="text-xs text-text-secondary mt-1 line-clamp-2">{session.description}</p>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-text-secondary">
            <span className="flex items-center gap-1"><Calendar size={11} />{session.date}</span>
            <span className="flex items-center gap-1"><Clock size={11} />{session.time}</span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="default" className="text-[10px] px-1.5 py-0 leading-none">
              {session.circleName}
            </Badge>
            {isUpcoming && (
              <span className="text-[10px] text-text-secondary flex items-center gap-1">
                <Users size={10} />{session.registered}/{session.slots} terdaftar
              </span>
            )}
          </div>
        </div>
      </div>
      {isUpcoming && (
        <ProtectedAction label="Masuk untuk Mendaftar Sesi">
          <button className="mt-3 w-full h-9 text-xs font-medium rounded-lg bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 active:scale-[0.97] transition-all">
            Daftar Sesi
          </button>
        </ProtectedAction>
      )}
    </div>
  );
}
