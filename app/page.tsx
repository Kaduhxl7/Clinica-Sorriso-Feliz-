import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { DashboardCharts } from "@/components/dashboard-charts";
import { MetricCard } from "@/components/metric-card";
import { OperationalAlert } from "@/components/operational-alert";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { getDashboardStats, requireUser } from "@/lib/supabase/queries";

export default async function DashboardPage() {
  const { user } = await requireUser();
  if (!user?.email) redirect("/login");

  const stats = await getDashboardStats();
  const awaitingHuman = stats.byStatus.find((item) => item.name === "aguardando_humano")?.value ?? 0;
  const sentimentTotal = stats.positiveConversations + stats.neutralConversations + stats.negativeConversations;
  const negativeRate = sentimentTotal > 0 ? Math.round((stats.negativeConversations / sentimentTotal) * 100) : 0;

  return (
    <AppShell userEmail={user.email}>
      <RealtimeRefresh />
      <div className="mb-4 rounded-xl border border-border bg-surface px-4 py-4 shadow-soft sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Central de atendimento WhatsApp</h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
              Volume, sentimento, intencoes e prioridades do agente em tempo real.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-medium text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200">
              Realtime ativo
            </span>
            <span className="rounded-full bg-surface-muted px-3 py-1 text-muted">{negativeRate}% negativas classificadas</span>
          </div>
        </div>
      </div>

      <OperationalAlert awaitingHuman={awaitingHuman} />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Conversas" value={stats.totalConversations} helper="Threads reais registradas no Supabase" icon="message" />
        <MetricCard title="Mensagens" value={stats.totalMessages} helper="Entradas e respostas do agente" icon="messages" tone="info" />
        <MetricCard title="Aguardando humano" value={awaitingHuman} helper="Priorize estes atendimentos agora" icon="user-check" tone="warning" />
        <MetricCard title="Realtime" value="Ativo" helper="conversations, messages, metrics" icon="activity" tone="success" />
        <MetricCard title="Positivas" value={stats.positiveConversations} helper="Pacientes satisfeitos ou tranquilos" icon="smile" tone="success" />
        <MetricCard title="Neutras" value={stats.neutralConversations} helper="Conversas objetivas ou informativas" icon="meh" />
        <MetricCard title="Negativas" value={stats.negativeConversations} helper="Acompanhe possiveis atritos" icon="frown" tone="danger" />
      </div>

      <DashboardCharts stats={stats} />
    </AppShell>
  );
}
