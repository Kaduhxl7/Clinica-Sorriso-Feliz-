import { Search } from "lucide-react";
import type { ConversationStatus } from "@/lib/types";

const statuses: Array<{ value: ConversationStatus; label: string }> = [
  { value: "em_andamento", label: "Em andamento" },
  { value: "aguardando_humano", label: "Aguardando humano" },
  { value: "encerrada", label: "Encerrada" },
];

export function ConversationFilters({
  phone,
  keyword,
  status,
}: {
  phone?: string;
  keyword?: string;
  status?: string;
}) {
  return (
    <form className="grid gap-3 rounded-lg border border-border bg-white p-4 shadow-soft md:grid-cols-[1fr_1fr_220px_auto]">
      <label className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          name="phone"
          defaultValue={phone}
          placeholder="Buscar por telefone"
          className="h-11 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm outline-none focus:border-primary"
        />
      </label>
      <label className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          name="keyword"
          defaultValue={keyword}
          placeholder="Buscar por palavra-chave"
          className="h-11 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm outline-none focus:border-primary"
        />
      </label>
      <select
        name="status"
        defaultValue={status ?? ""}
        className="h-11 rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-primary"
      >
        <option value="">Todos os status</option>
        {statuses.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <button className="h-11 rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-cyan-800">
        Filtrar
      </button>
    </form>
  );
}
