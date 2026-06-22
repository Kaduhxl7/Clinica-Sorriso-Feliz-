import Link from "next/link";
import { ArrowUpRight, Inbox } from "lucide-react";
import type { Conversation } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { HumanAttentionBadge, IntentBadge, SentimentBadge, StatusBadge } from "@/components/status-badge";

export function ConversationsTable({ conversations }: { conversations: Conversation[] }) {
  if (conversations.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-border bg-surface p-8 text-center shadow-soft">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-muted">
          <Inbox className="h-5 w-5" />
        </div>
        <p className="mt-4 font-medium">Nenhuma conversa encontrada</p>
        <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted">
          Ajuste os filtros ou aguarde novas mensagens do WhatsApp chegarem pelo workflow da Evolution.
        </p>
        <Link href="/conversations" className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
          Ver todas as conversas
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border bg-surface shadow-soft">
      <div className="grid gap-3 p-3 md:hidden">
        {conversations.map((conversation) => (
          <Link
            key={conversation.id}
            href={`/conversations/${conversation.id}`}
            className="rounded-lg border border-border bg-surface-muted/40 p-4 transition hover:bg-surface-muted"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{conversation.patient_name || conversation.patient_phone_e164}</p>
                <p className="mt-1 text-sm text-muted">{conversation.patient_phone_e164}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 flex-none text-muted" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge status={conversation.status} />
              <IntentBadge intent={conversation.intent} />
              <SentimentBadge sentiment={conversation.sentiment} />
              <HumanAttentionBadge status={conversation.status} intent={conversation.intent} />
            </div>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-foreground/80">
              {conversation.last_message_preview || conversation.summary || "Sem previa de mensagem."}
            </p>
            <p className="mt-3 text-xs text-muted">{formatDateTime(conversation.last_message_at ?? conversation.updated_at)}</p>
          </Link>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
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
