import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ConversationThread } from "@/components/conversation-thread";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { getConversationDetails, requireUser } from "@/lib/supabase/queries";

type ConversationDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ConversationDetailsPage({ params }: ConversationDetailsPageProps) {
  const { user } = await requireUser();
  if (!user?.email) redirect("/login");

  const { id } = await params;
  const { conversation, messages, metrics } = await getConversationDetails(id);
  if (!conversation) notFound();

  return (
    <AppShell userEmail={user.email}>
      <RealtimeRefresh conversationId={id} />
      <div className="mb-6 rounded-xl border border-border bg-surface p-5 shadow-soft sm:p-6">
        <Link href="/conversations" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Voltar para conversas
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Detalhes da conversa</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          Historico completo, status, intencao, sentimento e metricas operacionais da conversa.
        </p>
      </div>

      <ConversationThread conversation={conversation} messages={messages} metrics={metrics} />
    </AppShell>
  );
}
