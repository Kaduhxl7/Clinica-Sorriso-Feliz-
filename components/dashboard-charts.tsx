"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

export function DashboardCharts({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <section className="rounded-lg border border-border bg-surface p-5 shadow-soft xl:col-span-2">
        <div className="mb-4">
          <h2 className="font-semibold">Conversas por dia</h2>
          <p className="text-sm text-muted">Ultimos 14 dias com conversas registradas</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.byDay}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tickFormatter={formatDay} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip labelFormatter={(value) => formatDay(String(value))} />
              <Bar dataKey="total" fill="#0891b2" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5 shadow-soft">
        <div className="mb-4">
          <h2 className="font-semibold">Status</h2>
          <p className="text-sm text-muted">Distribuicao atual</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={stats.byStatus} dataKey="value" nameKey="name" outerRadius={96} label>
                {stats.byStatus.map((entry) => (
                  <Cell key={entry.name} fill={statusColors[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5 shadow-soft xl:col-span-3">
        <div className="mb-4">
          <h2 className="font-semibold">Intencao</h2>
          <p className="text-sm text-muted">Classificacao gerada pelo Gemini</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.byIntent} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {stats.byIntent.map((entry) => (
                  <Cell key={entry.name} fill={intentColors[entry.name]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5 shadow-soft xl:col-span-3">
        <div className="mb-4">
          <h2 className="font-semibold">Sentimento</h2>
          <p className="text-sm text-muted">Distribuicao emocional classificada pelo Gemini</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.bySentiment} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={140} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {stats.bySentiment.map((entry) => (
                  <Cell key={entry.name} fill={sentimentColors[entry.name]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5 shadow-soft xl:col-span-2">
        <div className="mb-4">
          <h2 className="font-semibold">Mensagens por dia</h2>
          <p className="text-sm text-muted">Volume diario recebido e enviado pelo agente</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.messagesByDay}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tickFormatter={formatDay} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip labelFormatter={(value) => formatDay(String(value))} />
              <Bar dataKey="total" fill="#0f766e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5 shadow-soft">
        <div className="mb-4">
          <h2 className="font-semibold">Crescimento</h2>
          <p className="text-sm text-muted">Conversas acumuladas nos ultimos dias</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.growthByDay}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tickFormatter={formatDay} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip labelFormatter={(value) => formatDay(String(value))} />
              <Line type="monotone" dataKey="total" stroke="#0891b2" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
