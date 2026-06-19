import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ConversationFilters } from "@/components/conversation-filters";
import { ConversationsTable } from "@/components/conversations-table";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import type { ConversationStatus } from "@/lib/types";
import { getConversations, requireUser } from "@/lib/supabase/queries";

const validStatuses: ConversationStatus[] = ["em_andamento", "aguardando_humano", "encerrada"];

type ConversationsPageProps = {
  searchParams?: Promise<{
    phone?: string;
    keyword?: string;
    status?: string;
  }>;
};

export default async function ConversationsPage({ searchParams }: ConversationsPageProps) {
  const { user } = await requireUser();
  if (!user?.email) redirect("/login");

  const filters = (await searchParams) ?? {};
  const status = validStatuses.includes(filters.status as ConversationStatus)
    ? (filters.status as ConversationStatus)
    : undefined;
  const conversations = await getConversations({
    phone: filters.phone?.trim() || undefined,
    keyword: filters.keyword?.trim() || undefined,
    status,
  });

  return (
    <AppShell userEmail={user.email}>
      <RealtimeRefresh />
      <div className="mb-6">
        <p className="text-sm font-medium text-primary">Caixa de entrada</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Conversas</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Busque por telefone, palavra-chave, status e acompanhe novas mensagens em tempo real.
        </p>
      </div>

      <div className="space-y-5">
        <ConversationFilters phone={filters.phone} keyword={filters.keyword} status={status} />
        <ConversationsTable conversations={conversations} />
      </div>
    </AppShell>
  );
}
