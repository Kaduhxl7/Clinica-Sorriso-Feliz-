import type { ConversationIntent, ConversationStatus } from "@/lib/types";
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

export function StatusBadge({ status }: { status: ConversationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        status === "em_andamento" && "bg-cyan-50 text-cyan-800",
        status === "aguardando_humano" && "bg-amber-50 text-amber-800",
        status === "encerrada" && "bg-slate-100 text-slate-700",
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
        intent === "AGENDAMENTO" && "bg-emerald-50 text-emerald-800",
        intent === "ORCAMENTO" && "bg-blue-50 text-blue-800",
        intent === "DUVIDA" && "bg-violet-50 text-violet-800",
        intent === "HUMANO" && "bg-rose-50 text-rose-800",
      )}
    >
      {intentLabels[intent]}
    </span>
  );
}
