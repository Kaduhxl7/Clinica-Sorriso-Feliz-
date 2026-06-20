import type {
  Conversation,
  ConversationIntent,
  ConversationMetric,
  ConversationStatus,
  DashboardStats,
  Message,
} from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const statusValues: ConversationStatus[] = ["em_andamento", "aguardando_humano", "encerrada"];
const intentValues: Array<ConversationIntent | "SEM_INTENCAO"> = [
  "AGENDAMENTO",
  "ORCAMENTO",
  "DUVIDA",
  "HUMANO",
  "SEM_INTENCAO",
];

type ConversationStatsRow = Pick<Conversation, "id" | "status" | "intent" | "created_at">;
type MessageStatsRow = Pick<Message, "created_at">;

function sanitizeSearchTerm(value: string) {
  return value.replace(/[(),]/g, " ").trim();
}

export async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createSupabaseServerClient();

  const [conversationsCount, messagesCount, conversations, messages] = await Promise.all([
    supabase.from("conversations").select("id", { count: "exact", head: true }),
    supabase.from("messages").select("id", { count: "exact", head: true }),
    supabase
      .from("conversations")
      .select("id,status,intent,created_at")
      .order("created_at", { ascending: false })
      .limit(5000),
    supabase.from("messages").select("created_at").order("created_at", { ascending: false }).limit(10000),
  ]);

  if (conversationsCount.error) throw conversationsCount.error;
  if (messagesCount.error) throw messagesCount.error;
  if (conversations.error) throw conversations.error;
  if (messages.error) throw messages.error;

  const byDayMap = new Map<string, number>();
  const messagesByDayMap = new Map<string, number>();
  const byIntentMap = new Map<string, number>();
  const byStatusMap = new Map<string, number>();

  const conversationRows = (conversations.data ?? []) as ConversationStatsRow[];
  const sortedConversationRows = [...conversationRows].sort((a, b) => a.created_at.localeCompare(b.created_at));

  for (const row of conversationRows) {
    const day = row.created_at.slice(0, 10);
    byDayMap.set(day, (byDayMap.get(day) ?? 0) + 1);
    byIntentMap.set(row.intent ?? "SEM_INTENCAO", (byIntentMap.get(row.intent ?? "SEM_INTENCAO") ?? 0) + 1);
    byStatusMap.set(row.status, (byStatusMap.get(row.status) ?? 0) + 1);
  }

  for (const row of ((messages.data ?? []) as MessageStatsRow[])) {
    const day = row.created_at.slice(0, 10);
    messagesByDayMap.set(day, (messagesByDayMap.get(day) ?? 0) + 1);
  }

  let cumulativeTotal = 0;
  const growthByDay = Array.from(byDayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, total]) => {
      cumulativeTotal += total;
      return { day, total: cumulativeTotal };
    })
    .slice(-14);

  return {
    totalConversations: conversationsCount.count ?? 0,
    totalMessages: messagesCount.count ?? 0,
    byDay: Array.from(byDayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([day, total]) => ({ day, total })),
    messagesByDay: Array.from(messagesByDayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([day, total]) => ({ day, total })),
    growthByDay: sortedConversationRows.length === 0 ? [] : growthByDay,
    byIntent: intentValues.map((name) => ({ name, value: byIntentMap.get(name) ?? 0 })),
    byStatus: statusValues.map((name) => ({ name, value: byStatusMap.get(name) ?? 0 })),
  };
}

export async function getConversations(params: {
  phone?: string;
  keyword?: string;
  status?: ConversationStatus;
  intent?: ConversationIntent;
  dateFrom?: string;
  dateTo?: string;
  humanOnly?: boolean;
}) {
  const supabase = await createSupabaseServerClient();
  const keyword = sanitizeSearchTerm(params.keyword ?? "");
  let keywordConversationIds: string[] = [];

  if (keyword) {
    const { data, error } = await supabase
      .from("messages")
      .select("conversation_id")
      .ilike("body", `%${keyword}%`)
      .limit(100);

    if (error) throw error;
    keywordConversationIds = Array.from(
      new Set(((data ?? []) as Pick<Message, "conversation_id">[]).map((row) => row.conversation_id)),
    );
  }

  let query = supabase
    .from("conversations")
    .select("*")
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(100);

  if (params.phone) {
    query = query.ilike("patient_phone_e164", `%${params.phone}%`);
  }

  if (params.status) {
    query = query.eq("status", params.status);
  }

  if (params.intent) {
    query = query.eq("intent", params.intent);
  }

  if (params.dateFrom) {
    query = query.gte("created_at", `${params.dateFrom}T00:00:00.000Z`);
  }

  if (params.dateTo) {
    query = query.lte("created_at", `${params.dateTo}T23:59:59.999Z`);
  }

  if (params.humanOnly) {
    query = query.or("status.eq.aguardando_humano,intent.eq.HUMANO");
  }

  if (keyword) {
    const clauses = [
      `patient_name.ilike.%${keyword}%`,
      `summary.ilike.%${keyword}%`,
      `last_message_preview.ilike.%${keyword}%`,
    ];

    if (keywordConversationIds.length > 0) {
      clauses.push(`id.in.(${keywordConversationIds.join(",")})`);
    }

    query = query.or(clauses.join(","));
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Conversation[];
}

export async function getConversationDetails(id: string): Promise<{
  conversation: Conversation | null;
  messages: Message[];
  metrics: ConversationMetric | null;
}> {
  const supabase = await createSupabaseServerClient();

  const [conversation, messages, metrics] = await Promise.all([
    supabase.from("conversations").select("*").eq("id", id).maybeSingle(),
    supabase.from("messages").select("*").eq("conversation_id", id).order("sent_at", { ascending: true }),
    supabase.from("conversation_metrics").select("*").eq("conversation_id", id).maybeSingle(),
  ]);

  if (conversation.error) throw conversation.error;
  if (messages.error) throw messages.error;
  if (metrics.error) throw metrics.error;

  return {
    conversation: conversation.data,
    messages: messages.data as Message[],
    metrics: metrics.data as ConversationMetric | null,
  };
}
