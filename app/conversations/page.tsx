import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ConversationFilters } from "@/components/conversation-filters";
import { ConversationsTable } from "@/components/conversations-table";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import type { ConversationIntent, ConversationSentiment, ConversationStatus } from "@/lib/types";
import { getConversations, requireUser } from "@/lib/supabase/queries";

const validStatuses: ConversationStatus[] = ["em_andamento", "aguardando_humano", "encerrada"];
const validIntents: ConversationIntent[] = ["AGENDAMENTO", "ORCAMENTO", "DUVIDA", "HUMANO"];
const validSentiments: ConversationSentiment[] = ["POSITIVO", "NEUTRO", "NEGATIVO"];

type ConversationsPageProps = {
  searchParams?: Promise<{
    phone?: string;
    keyword?: string;
    status?: string;
    intent?: string;
    sentiment?: string;
    dateFrom?: string;
    dateTo?: string;
    humanOnly?: string;
  }>;
};

export default async function ConversationsPage({ searchParams }: ConversationsPageProps) {
  const { user } = await requireUser();
  if (!user?.email) redirect("/login");

  const filters = (await searchParams) ?? {};
  const status = validStatuses.includes(filters.status as ConversationStatus)
    ? (filters.status as ConversationStatus)
    : undefined;
  const intent = validIntents.includes(filters.intent as ConversationIntent)
    ? (filters.intent as ConversationIntent)
    : undefined;
  const sentiment = validSentiments.includes(filters.sentiment as ConversationSentiment)
    ? (filters.sentiment as ConversationSentiment)
    : undefined;
  const conversations = await getConversations({
    phone: filters.phone?.trim() || undefined,
    keyword: filters.keyword?.trim() || undefined,
    status,
    intent,
    sentiment,
    dateFrom: filters.dateFrom?.trim() || undefined,
    dateTo: filters.dateTo?.trim() || undefined,
    humanOnly: filters.humanOnly === "true",
  });

  return (
    <AppShell userEmail={user.email}>
      <RealtimeRefresh />
      <div className="mb-6 rounded-xl border border-border bg-surface p-5 shadow-soft sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Caixa de entrada</p>
        <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Conversas</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              Busque por telefone, mensagem, intencao, sentimento, status, periodo e acompanhe novas mensagens em tempo real.
            </p>
          </div>
          <div className="rounded-lg bg-surface-muted px-4 py-3 text-sm">
            <p className="font-medium">{conversations.length} conversas exibidas</p>
            <p className="mt-1 text-muted">Resultado dos filtros atuais</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <ConversationFilters
          phone={filters.phone}
          keyword={filters.keyword}
          status={status}
          intent={intent}
          sentiment={sentiment}
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          humanOnly={filters.humanOnly === "true"}
        />
        <ConversationsTable conversations={conversations} />
      </div>
    </AppShell>
  );
}
