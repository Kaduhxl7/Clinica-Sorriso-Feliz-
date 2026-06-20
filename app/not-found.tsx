import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="max-w-md rounded-lg border border-border bg-surface p-6 text-center shadow-soft">
        <h1 className="text-xl font-semibold">Conversa nao encontrada</h1>
        <p className="mt-2 text-sm text-muted">O registro pode ter sido encerrado, removido ou estar indisponivel.</p>
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
