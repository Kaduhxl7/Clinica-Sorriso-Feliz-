"use client";

import { useSupabaseRealtimeRefresh } from "@/lib/hooks/use-supabase-realtime-refresh";

export function RealtimeRefresh({ conversationId }: { conversationId?: string }) {
  useSupabaseRealtimeRefresh({ conversationId });
  return null;
}
