import Link from "next/link";
import type { Conversation } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { HumanAttentionBadge, IntentBadge, SentimentBadge, StatusBadge } from "@/components/status-badge";

export function ConversationsTable({ conversations }: { conversations: Conversation[] }) {
  if (conversations.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-surface p-8 text-center shadow-soft">
        <p className="font-medium">Nenhuma conversa encontrada</p>
        <p className="mt-1 text-sm text-muted">Os filtros atuais nao retornaram dados do Supabase.</p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-muted">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Paciente</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Intencao</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Sentimento</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Atencao</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Ultima mensagem</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Atualizada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {conversations.map((conversation) => (
              <tr key={conversation.id} className="hover:bg-surface-muted/70">
                <td className="px-4 py-4">
                  <Link href={`/conversations/${conversation.id}`} className="font-medium text-primary hover:underline">
                    {conversation.patient_name || conversation.patient_phone_e164}
                  </Link>
                  <p className="text-sm text-muted">{conversation.patient_phone_e164}</p>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={conversation.status} />
                </td>
                <td className="px-4 py-4">
                  <IntentBadge intent={conversation.intent} />
                </td>
                <td className="px-4 py-4">
                  <SentimentBadge sentiment={conversation.sentiment} />
                </td>
                <td className="px-4 py-4">
                  <HumanAttentionBadge status={conversation.status} intent={conversation.intent} />
                </td>
                <td className="max-w-md px-4 py-4 text-sm text-foreground/80">
                  <p className="line-clamp-2">{conversation.last_message_preview || conversation.summary || "-"}</p>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-muted">
                  {formatDateTime(conversation.last_message_at ?? conversation.updated_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
