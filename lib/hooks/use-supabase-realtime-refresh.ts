"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type RealtimeRefreshOptions = {
  conversationId?: string;
};

export function useSupabaseRealtimeRefresh(options: RealtimeRefreshOptions = {}) {
  const router = useRouter();
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase.channel(`dashboard-refresh-${options.conversationId ?? "all"}`);
    const refresh = () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(() => router.refresh(), 300);
    };

    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "conversations" },
      refresh,
    );

    const messagesConfig = options.conversationId
      ? { event: "*" as const, schema: "public", table: "messages", filter: `conversation_id=eq.${options.conversationId}` }
      : { event: "*" as const, schema: "public", table: "messages" };

    const metricsConfig = options.conversationId
      ? {
          event: "*" as const,
          schema: "public",
          table: "conversation_metrics",
          filter: `conversation_id=eq.${options.conversationId}`,
        }
      : { event: "*" as const, schema: "public", table: "conversation_metrics" };

    channel.on("postgres_changes", messagesConfig, refresh);
    channel.on("postgres_changes", metricsConfig, refresh);

    channel.subscribe();

    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      supabase.removeChannel(channel);
    };
  }, [options.conversationId, router]);
}
