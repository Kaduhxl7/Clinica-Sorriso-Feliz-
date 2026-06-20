export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6 text-center shadow-soft">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
        <p className="mt-4 font-medium">Carregando dados reais</p>
        <p className="mt-1 text-sm text-muted">Consultando Supabase e atualizando metricas.</p>
      </div>
    </main>
  );
}
