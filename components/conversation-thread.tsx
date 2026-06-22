import type { Conversation, ConversationMetric, Message } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { HumanAttentionBadge, IntentBadge, SentimentBadge, StatusBadge } from "@/components/status-badge";

export function ConversationThread({
  conversation,
  messages,
  metrics,
}: {
  conversation: Conversation;
  messages: Message[];
  metrics: ConversationMetric | null;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-soft">
        <div className="border-b border-border bg-surface-muted/35 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold">{conversation.patient_name || conversation.patient_phone_e164}</h2>
              <p className="mt-1 text-sm text-muted">{conversation.patient_phone_e164}</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <StatusBadge status={conversation.status} />
              <IntentBadge intent={conversation.intent} />
              <SentimentBadge sentiment={conversation.sentiment} />
              <HumanAttentionBadge status={conversation.status} intent={conversation.intent} />
            </div>
          </div>
        </div>

        <div className="space-y-4 bg-surface p-4 sm:p-5">
          {messages.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-surface-muted/40 p-6 text-center text-sm text-muted">
              Nenhuma mensagem registrada para esta conversa.
            </div>
          ) : (
            messages.map((message) => {
              const outbound = message.direction === "outbound";
              return (
                <article key={message.id} className={outbound ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      outbound
                        ? "max-w-[86%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-white shadow-soft sm:max-w-[74%]"
                        : "max-w-[86%] rounded-2xl rounded-bl-sm bg-surface-muted px-4 py-3 text-foreground shadow-soft sm:max-w-[74%]"
                    }
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2 text-xs opacity-80">
                      <span className="font-medium">{message.sender}</span>
                      <span>{formatDateTime(message.sent_at)}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.body || `[${message.message_type}]`}</p>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <aside className="space-y-5 xl:sticky xl:top-8 xl:self-start">
        <section className="rounded-lg border border-border bg-surface p-5 shadow-soft">
          <h3 className="font-semibold">Resumo</h3>
          <p className="mt-3 text-sm leading-6 text-foreground/80">{conversation.summary || "Sem resumo gerado."}</p>
          {conversation.handoff_reason ? (
            <div className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-400/10 dark:text-amber-200">
              {conversation.handoff_reason}
            </div>
          ) : null}
        </section>

        <section className="rounded-lg border border-border bg-surface p-5 shadow-soft">
          <h3 className="font-semibold">Metricas</h3>
          <dl className="mt-4 grid gap-3 text-sm">
            <MetricRow label="Mensagens" value={metrics?.total_messages_count ?? messages.length} />
            <MetricRow label="Entrada" value={metrics?.inbound_messages_count ?? "-"} />
            <MetricRow label="IA" value={metrics?.outbound_agent_messages_count ?? "-"} />
            <MetricRow label="Humano" value={metrics?.outbound_human_messages_count ?? "-"} />
            <MetricRow label="Handoffs" value={metrics?.handoff_count ?? "-"} />
            <MetricRow label="Tokens IA" value={metrics?.total_ai_tokens ?? "-"} />
            <MetricRow label="Primeira resposta" value={formatSeconds(metrics?.first_response_seconds)} />
            <MetricRow label="Resolucao" value={formatSeconds(metrics?.resolution_seconds)} />
          </dl>
        </section>
      </aside>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-surface-muted/50 px-3 py-2">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function formatSeconds(value: number | null | undefined) {
  if (value == null) return "-";
  if (value < 60) return `${value}s`;
  return `${Math.round(value / 60)}min`;
}
