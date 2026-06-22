import type { ConversationIntent, ConversationSentiment, ConversationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusLabels: Record<ConversationStatus, string> = {
  em_andamento: "Em andamento",
  aguardando_humano: "Aguardando humano",
  encerrada: "Encerrada",
};

const intentLabels: Record<ConversationIntent, string> = {
  AGENDAMENTO: "Agendamento",
  ORCAMENTO: "Orcamento",
  DUVIDA: "Duvida",
  HUMANO: "Humano",
};

const sentimentLabels: Record<ConversationSentiment, string> = {
  POSITIVO: "Positivo",
  NEUTRO: "Neutro",
  NEGATIVO: "Negativo",
};

export function StatusBadge({ status }: { status: ConversationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        status === "em_andamento" && "bg-cyan-50 text-cyan-800 dark:bg-cyan-400/10 dark:text-cyan-200",
        status === "aguardando_humano" && "bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200",
        status === "encerrada" && "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

export function IntentBadge({ intent }: { intent: ConversationIntent | null }) {
  if (!intent) {
    return <span className="text-xs text-muted">Sem intencao</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        intent === "AGENDAMENTO" && "bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200",
        intent === "ORCAMENTO" && "bg-blue-50 text-blue-800 dark:bg-blue-400/10 dark:text-blue-200",
        intent === "DUVIDA" && "bg-violet-50 text-violet-800 dark:bg-violet-400/10 dark:text-violet-200",
        intent === "HUMANO" && "bg-rose-50 text-rose-800 dark:bg-rose-400/10 dark:text-rose-200",
      )}
    >
      {intentLabels[intent]}
    </span>
  );
}

export function SentimentBadge({ sentiment }: { sentiment: ConversationSentiment | null }) {
  if (!sentiment) {
    return <span className="text-xs text-muted">Sem sentimento</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        sentiment === "POSITIVO" && "bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200",
        sentiment === "NEUTRO" && "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
        sentiment === "NEGATIVO" && "bg-rose-50 text-rose-800 dark:bg-rose-400/10 dark:text-rose-200",
      )}
    >
      {sentimentLabels[sentiment]}
    </span>
  );
}

export function HumanAttentionBadge({
  status,
  intent,
}: {
  status: ConversationStatus;
  intent: ConversationIntent | null;
}) {
  const needsHuman = status === "aguardando_humano" || intent === "HUMANO";

  if (!needsHuman) return null;

  return (
    <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900 shadow-sm dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-200">
      Atencao humana
    </span>
  );
}
