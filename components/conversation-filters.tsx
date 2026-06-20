import { Search } from "lucide-react";
import type { ConversationIntent, ConversationStatus } from "@/lib/types";

const statuses: Array<{ value: ConversationStatus; label: string }> = [
  { value: "em_andamento", label: "Em andamento" },
  { value: "aguardando_humano", label: "Aguardando humano" },
  { value: "encerrada", label: "Encerrada" },
];

const intents: Array<{ value: ConversationIntent; label: string }> = [
  { value: "AGENDAMENTO", label: "Agendamento" },
  { value: "ORCAMENTO", label: "Orcamento" },
  { value: "DUVIDA", label: "Duvida" },
  { value: "HUMANO", label: "Humano" },
];

export function ConversationFilters({
  phone,
  keyword,
  status,
  intent,
  dateFrom,
  dateTo,
  humanOnly,
}: {
  phone?: string;
  keyword?: string;
  status?: string;
  intent?: string;
  dateFrom?: string;
  dateTo?: string;
  humanOnly?: boolean;
}) {
  return (
    <form className="grid gap-3 rounded-lg border border-border bg-surface p-4 shadow-soft md:grid-cols-2 xl:grid-cols-[1fr_1fr_180px_180px_150px_150px_auto]">
      <label className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          name="phone"
          defaultValue={phone}
          placeholder="Buscar por telefone"
          className="h-11 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm outline-none focus:border-primary"
        />
      </label>
      <label className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          name="keyword"
          defaultValue={keyword}
          placeholder="Buscar por mensagem"
          className="h-11 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm outline-none focus:border-primary"
        />
      </label>
      <select
        name="status"
        defaultValue={status ?? ""}
        className="h-11 rounded-md border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
      >
        <option value="">Todos os status</option>
        {statuses.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <select
        name="intent"
        defaultValue={intent ?? ""}
        className="h-11 rounded-md border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
      >
        <option value="">Todas intencoes</option>
        {intents.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <input
        type="date"
        name="dateFrom"
        defaultValue={dateFrom}
        aria-label="Data inicial"
        className="h-11 rounded-md border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
      />
      <input
        type="date"
        name="dateTo"
        defaultValue={dateTo}
        aria-label="Data final"
        className="h-11 rounded-md border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
      />
      <label className="flex h-11 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm font-medium text-foreground">
        <input
          type="checkbox"
          name="humanOnly"
          value="true"
          defaultChecked={humanOnly}
          className="h-4 w-4 rounded border-border text-primary"
        />
        Humano
      </label>
      <button className="h-11 rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-cyan-800">
        Filtrar
      </button>
    </form>
  );
}
