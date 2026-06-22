import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="max-w-md rounded-xl border border-border bg-surface p-6 text-center shadow-elevated">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-muted">
          <SearchX className="h-5 w-5" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Conversa nao encontrada</h1>
        <p className="mt-2 text-sm leading-6 text-muted">O registro pode ter sido encerrado, removido ou estar indisponivel.</p>
        <Link
          href="/conversations"
          className="mt-5 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white"
        >
          Ver conversas
        </Link>
      </section>
    </main>
  );
}
