import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

export function OperationalAlert({ awaitingHuman }: { awaitingHuman: number }) {
  if (awaitingHuman <= 0) {
    return (
      <section className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-soft dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-100">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
            <AlertTriangle className="h-4 w-4" aria-hidden />
          </div>
          <div>
            <p className="font-semibold">Nenhuma conversa aguardando atendimento humano</p>
            <p className="mt-0.5 text-emerald-800/80 dark:text-emerald-100/75">O agente esta operando sem fila manual no momento.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <Link
      href="/conversations?humanOnly=true"
      className="mb-6 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4" aria-hidden />
        </div>
        <div>
          <p className="font-semibold">
            {awaitingHuman} {awaitingHuman === 1 ? "conversa aguardando" : "conversas aguardando"} atendimento humano
          </p>
          <p className="mt-0.5 text-amber-900/75 dark:text-amber-100/75">Clique para abrir a inbox ja filtrada por prioridade.</p>
        </div>
      </div>
      <span className="inline-flex items-center gap-2 font-semibold">
        Ver agora
        <ArrowRight className="h-4 w-4" aria-hidden />
      </span>
    </Link>
  );
}
