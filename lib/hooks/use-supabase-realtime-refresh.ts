"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type RealtimeRefreshOptions = {
  conversationId?: string;
};

export function useSupabaseRealtimeRefresh(options: RealtimeRefreshOptions = {}) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase.channel(`dashboard-refresh-${options.conversationId ?? "all"}`);

    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "conversations" },
      () => router.refresh(),
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

    channel.on("postgres_changes", messagesConfig, () => router.refresh());
    channel.on("postgres_changes", metricsConfig, () => router.refresh());

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [options.conversationId, router]);
}
