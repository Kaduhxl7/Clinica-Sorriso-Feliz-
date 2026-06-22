"use client";

import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 text-center shadow-elevated">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="mt-4 text-sm font-medium text-primary">Falha ao carregar dashboard</p>
        <h1 className="mt-2 text-2xl font-semibold">Verifique a conexao com Supabase</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          A aplicacao nao usa dados mockados. Se o Supabase estiver indisponivel ou as variaveis de ambiente estiverem
          incorretas, a pagina exibe este estado.
        </p>
        <p className="mt-3 rounded-md bg-surface-muted p-3 text-left text-xs leading-5 text-muted">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
        >
          Tentar novamente
        </button>
      </section>
    </main>
  );
}
