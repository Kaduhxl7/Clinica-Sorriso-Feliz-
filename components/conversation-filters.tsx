import Link from "next/link";
import { Search } from "lucide-react";
import type { ConversationIntent, ConversationSentiment, ConversationStatus } from "@/lib/types";

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

const sentiments: Array<{ value: ConversationSentiment; label: string }> = [
  { value: "POSITIVO", label: "Positivo" },
  { value: "NEUTRO", label: "Neutro" },
  { value: "NEGATIVO", label: "Negativo" },
];

export function ConversationFilters({
  phone,
  keyword,
  status,
  intent,
  sentiment,
  dateFrom,
  dateTo,
  humanOnly,
}: {
  phone?: string;
  keyword?: string;
  status?: string;
  intent?: string;
  sentiment?: string;
  dateFrom?: string;
  dateTo?: string;
  humanOnly?: boolean;
}) {
  return (
    <form className="rounded-lg border border-border bg-surface p-4 shadow-soft">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-semibold">Filtros de atendimento</h2>
          <p className="text-sm text-muted">Combine busca, classificacoes e periodo para localizar conversas rapidamente.</p>
        </div>
        <Link href="/conversations" className="text-sm font-medium text-primary hover:underline">
          Limpar filtros
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.2fr_1.2fr_repeat(3,170px)_145px_145px_auto]">
        <FilterLabel label="Telefone">
          <Search className="pointer-events-none absolute left-3 top-[2.6rem] h-4 w-4 text-muted" />
          <input
            name="phone"
            defaultValue={phone}
            placeholder="+5531999999999"
            className="h-11 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm outline-none transition focus:border-primary"
            inputMode="tel"
          />
        </FilterLabel>
        <FilterLabel label="Mensagem">
          <Search className="pointer-events-none absolute left-3 top-[2.6rem] h-4 w-4 text-muted" />
          <input
            name="keyword"
            defaultValue={keyword}
            placeholder="dor, agendar, orcamento..."
            className="h-11 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm outline-none transition focus:border-primary"
          />
        </FilterLabel>
        <FilterLabel label="Status">
          <select
            name="status"
            defaultValue={status ?? ""}
            className="h-11 rounded-md border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="">Todos</option>
            {statuses.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </FilterLabel>
        <FilterLabel label="Intencao">
          <select
            name="intent"
            defaultValue={intent ?? ""}
            className="h-11 rounded-md border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="">Todas</option>
            {intents.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </FilterLabel>
        <FilterLabel label="Sentimento">
          <select
            name="sentiment"
            defaultValue={sentiment ?? ""}
            className="h-11 rounded-md border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="">Todos</option>
            {sentiments.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </FilterLabel>
        <FilterLabel label="Inicio">
          <input
            type="date"
            name="dateFrom"
            defaultValue={dateFrom}
            className="h-11 rounded-md border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
          />
        </FilterLabel>
        <FilterLabel label="Fim">
          <input
            type="date"
            name="dateTo"
            defaultValue={dateTo}
            className="h-11 rounded-md border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
          />
        </FilterLabel>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted">Prioridade</span>
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
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button className="h-11 w-full rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:bg-cyan-800 sm:w-auto">
          Aplicar filtros
        </button>
      </div>
    </form>
  );
}

function FilterLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="relative flex flex-col gap-2">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
