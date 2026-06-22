"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardStats } from "@/lib/types";
import { EmptyState } from "@/components/empty-state";
import { formatDay } from "@/lib/utils";

const statusColors: Record<string, string> = {
  em_andamento: "#0891b2",
  aguardando_humano: "#d97706",
  encerrada: "#64748b",
};

const intentColors: Record<string, string> = {
  AGENDAMENTO: "#059669",
  ORCAMENTO: "#2563eb",
  DUVIDA: "#7c3aed",
  HUMANO: "#e11d48",
  SEM_INTENCAO: "#94a3b8",
};

const sentimentColors: Record<string, string> = {
  POSITIVO: "#059669",
  NEUTRO: "#64748b",
  NEGATIVO: "#e11d48",
  SEM_SENTIMENTO: "#94a3b8",
};

const statusLabels: Record<string, string> = {
  em_andamento: "Em andamento",
  aguardando_humano: "Aguardando humano",
  encerrada: "Encerrada",
};

const intentLabels: Record<string, string> = {
  AGENDAMENTO: "Agendamento",
  ORCAMENTO: "Orcamento",
  DUVIDA: "Duvida",
  HUMANO: "Humano",
  SEM_INTENCAO: "Sem intencao",
};

const sentimentLabels: Record<string, string> = {
  POSITIVO: "Positivo",
  NEUTRO: "Neutro",
  NEGATIVO: "Negativo",
  SEM_SENTIMENTO: "Sem sentimento",
};

export function DashboardCharts({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <ChartCard title="Conversas por dia" description="Ultimos 14 dias com conversas registradas" className="xl:col-span-2">
        <div className="h-80">
          {hasChartData(stats.byDay) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border))" />
                <XAxis dataKey="day" tickFormatter={formatDay} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip labelFormatter={formatDay} valueLabel="Conversas" />} />
                <Bar dataKey="total" fill="#0891b2" radius={[6, 6, 0, 0]} barSize={34} minPointSize={3} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState title="Sem conversas no periodo" text="As conversas aparecerao aqui quando o agente receber mensagens." />
          )}
        </div>
      </ChartCard>

      <ChartCard title="Status" description="Distribuicao atual">
        <div className="h-80">
          {hasChartData(stats.byStatus) ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.byStatus} dataKey="value" nameKey="name" innerRadius={58} outerRadius={94} paddingAngle={3}>
                  {stats.byStatus.map((entry) => (
                    <Cell key={entry.name} fill={statusColors[entry.name]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip nameFormatter={(value) => statusLabels[value] ?? value} valueLabel="Conversas" />} />
                <Legend formatter={(value) => statusLabels[String(value)] ?? value} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState title="Sem status disponivel" text="Nenhum status foi calculado ainda." />
          )}
        </div>
      </ChartCard>

      <ChartCard title="Intencao" description="Classificacao gerada pelo Gemini" className="xl:col-span-3">
        <div className="h-80">
          {hasChartData(stats.byIntent) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byIntent} layout="vertical" margin={{ left: 24, right: 24 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgb(var(--border))" />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" width={130} tickFormatter={(value) => intentLabels[value] ?? value} />
                <Tooltip content={<ChartTooltip nameFormatter={(value) => intentLabels[value] ?? value} valueLabel="Conversas" />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28} minPointSize={3}>
                  {stats.byIntent.map((entry) => (
                    <Cell key={entry.name} fill={intentColors[entry.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState title="Sem intencoes classificadas" text="As intencoes classificadas pelo Gemini aparecerao aqui." />
          )}
        </div>
      </ChartCard>

      <ChartCard title="Sentimento" description="Distribuicao emocional classificada pelo Gemini" className="xl:col-span-3">
        <div className="h-80">
          {hasChartData(stats.bySentiment, "SEM_SENTIMENTO") ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.bySentiment} layout="vertical" margin={{ left: 24, right: 24 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgb(var(--border))" />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" width={150} tickFormatter={(value) => sentimentLabels[value] ?? value} />
                <Tooltip content={<ChartTooltip nameFormatter={(value) => sentimentLabels[value] ?? value} valueLabel="Conversas" />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28} minPointSize={3}>
                  {stats.bySentiment.map((entry) => (
                    <Cell key={entry.name} fill={sentimentColors[entry.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState
              title="Nenhum sentimento classificado"
              text="Quando o Gemini classificar conversas como positivas, neutras ou negativas, a distribuicao aparece aqui."
            />
          )}
        </div>
      </ChartCard>

      <ChartCard title="Mensagens por dia" description="Volume diario recebido e enviado pelo agente" className="xl:col-span-2">
        <div className="h-80">
          {hasChartData(stats.messagesByDay) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.messagesByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border))" />
                <XAxis dataKey="day" tickFormatter={formatDay} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip labelFormatter={formatDay} valueLabel="Mensagens" />} />
                <Bar dataKey="total" fill="#0f766e" radius={[6, 6, 0, 0]} barSize={34} minPointSize={3} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState title="Sem mensagens salvas" text="O volume diario aparece apos o agente salvar mensagens." />
          )}
        </div>
      </ChartCard>

      <ChartCard title="Crescimento" description="Conversas acumuladas nos ultimos dias">
        <div className="h-80">
          {hasChartData(stats.growthByDay) ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.growthByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border))" />
                <XAxis dataKey="day" tickFormatter={formatDay} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip labelFormatter={formatDay} valueLabel="Total acumulado" />} />
                <Line type="monotone" dataKey="total" stroke="#0891b2" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState title="Sem crescimento ainda" text="O crescimento fica disponivel quando houver conversas." />
          )}
        </div>
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-lg border border-border bg-surface p-5 shadow-soft ${className ?? ""}`}>
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="text-sm text-muted">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  nameFormatter,
  valueLabel,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; name?: string; payload?: { name?: string } }>;
  label?: string;
  labelFormatter?: (value: string) => string;
  nameFormatter?: (value: string) => string;
  valueLabel: string;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const rawName = item.payload?.name ?? item.name ?? label ?? "";
  const displayLabel = label ? labelFormatter?.(label) ?? label : nameFormatter?.(rawName) ?? rawName;

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-sm shadow-elevated">
      <p className="font-medium">{displayLabel}</p>
      <p className="mt-1 text-muted">
        {valueLabel}: <span className="font-semibold text-foreground">{item.value ?? 0}</span>
      </p>
    </div>
  );
}

function ChartEmptyState({ title, text }: { title: string; text: string }) {
  return <EmptyState icon="chart" title={title} description={text} compact />;
}

function hasChartData(data: Array<{ name?: string; value?: number; total?: number }>, excludedName?: string) {
  return data.some((item) => item.name !== excludedName && (item.value ?? item.total ?? 0) > 0);
}
