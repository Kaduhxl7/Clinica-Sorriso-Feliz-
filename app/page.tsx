import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { DashboardCharts } from "@/components/dashboard-charts";
import { MetricCard } from "@/components/metric-card";
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
      <div className="mb-6 rounded-xl border border-border bg-surface p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Operacao em tempo real</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Central de atendimento WhatsApp</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              Monitore volume, qualidade percebida, intencoes e conversas que precisam de uma pessoa da equipe.
            </p>
          </div>
          <div className="rounded-lg bg-surface-muted px-4 py-3 text-sm">
            <p className="font-medium">Saude operacional</p>
            <p className="mt-1 text-muted">{negativeRate}% negativas entre conversas com sentimento classificado</p>
          </div>
        </div>
      </div>

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
