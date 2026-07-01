"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase/client";

function WaitingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cardId = searchParams.get("cardId");
  const { user, isLoading } = useAuth();
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.replace("/login"); return; }
  }, [user, isLoading, router]);

  useEffect(() => {
    const i = setInterval(() => setDotCount((p) => (p + 1) % 4), 500);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (!supabase || !user || !cardId) return;

    const channel = supabase
      .channel(`bisik-wait-${cardId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "bisik_chats",
        filter: `receiver_id=eq.${user.id}`,
      }, (payload: any) => {
        const chatId = payload.new?.id;
        if (chatId) router.replace(`/bisik/chat/${chatId}`);
      })
      .subscribe();

    return () => { supabase?.removeChannel(channel); };
  }, [user, cardId, router]);

  const handleCancel = async () => {
    if (!supabase || !user || !cardId) return;
    await supabase.from("bisik_cards").update({ is_active: false }).eq("id", cardId);
    router.replace("/bisik");
  };

  if (!cardId) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <p className="text-sm text-[#647488]">Link tidak valid</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] gap-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-[#084463] border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-[#1E2938]">Menunggu match{Array(dotCount).fill(".").join("")}</p>
        <p className="text-xs text-[#647488] mt-2">Kartumu sedang dicari teman ngobrol</p>
      </div>
      <button onClick={handleCancel}
        className="px-4 py-2 rounded-lg text-xs font-semibold text-[#647488] border border-[#E2E8F0] cursor-pointer">
        Batalkan
      </button>
    </div>
  );
}

export default function BisikWaitingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-neutral-300 border-t-[#084463]" />
      </div>
    }>
      <WaitingContent />
    </Suspense>
  );
}
