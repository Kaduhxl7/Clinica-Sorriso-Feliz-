import type { Conversation, ConversationMetric, Message } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { HumanAttentionBadge, IntentBadge, StatusBadge } from "@/components/status-badge";

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
    <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
      <section className="rounded-lg border border-border bg-surface shadow-soft">
        <div className="border-b border-border p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold">{conversation.patient_name || conversation.patient_phone_e164}</h2>
            <StatusBadge status={conversation.status} />
            <IntentBadge intent={conversation.intent} />
            <HumanAttentionBadge status={conversation.status} intent={conversation.intent} />
          </div>
          <p className="mt-1 text-sm text-muted">{conversation.patient_phone_e164}</p>
        </div>

        <div className="space-y-4 p-5">
          {messages.length === 0 ? (
            <p className="text-sm text-muted">Nenhuma mensagem registrada para esta conversa.</p>
          ) : (
            messages.map((message) => {
              const outbound = message.direction === "outbound";
              return (
                <article key={message.id} className={outbound ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      outbound
                        ? "max-w-[78%] rounded-lg bg-primary px-4 py-3 text-white"
                        : "max-w-[78%] rounded-lg bg-surface-muted px-4 py-3 text-foreground"
                    }
                  >
                    <div className="mb-1 flex items-center gap-2 text-xs opacity-80">
                      <span>{message.sender}</span>
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

      <aside className="space-y-5">
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
          <dl className="mt-4 space-y-3 text-sm">
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
    <div className="flex items-center justify-between gap-4">
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
