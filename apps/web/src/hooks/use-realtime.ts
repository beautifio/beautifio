"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase as supabaseClient } from "@/lib/supabase/client";

export function useRealtimeSubscription(
  table: string,
  filter?: string,
  queryKey?: string[]
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!supabaseClient) return;

    const supabase = supabaseClient;

    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter,
        },
        () => {
          if (queryKey) {
            queryClient.invalidateQueries({ queryKey });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, queryKey, queryClient]);
}
