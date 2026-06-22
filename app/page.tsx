import { redirect } from "next/navigation";
import { Activity, Frown, Meh, MessageCircle, MessagesSquare, Smile, UserRoundCheck } from "lucide-react";
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

  return (
    <AppShell userEmail={user.email}>
      <RealtimeRefresh />
      <div className="mb-6">
        <p className="text-sm font-medium text-primary">Operacao em tempo real</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Dados reais do agente de WhatsApp, atualizados pelo Supabase Realtime.
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total de conversas" value={stats.totalConversations} icon={MessageCircle} />
        <MetricCard title="Total de mensagens" value={stats.totalMessages} icon={MessagesSquare} />
        <MetricCard title="Aguardando humano" value={awaitingHuman} icon={UserRoundCheck} />
        <MetricCard title="Eventos monitorados" value="Realtime" helper="conversations, messages, metrics" icon={Activity} />
        <MetricCard title="Sentimento positivo" value={stats.positiveConversations} icon={Smile} />
        <MetricCard title="Sentimento neutro" value={stats.neutralConversations} icon={Meh} />
        <MetricCard title="Sentimento negativo" value={stats.negativeConversations} icon={Frown} />
      </div>

      <DashboardCharts stats={stats} />
    </AppShell>
  );
}
