import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { signIn } from "@/app/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/");

  const params = (await searchParams) ?? {};

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-elevated">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-soft">
            <MessageCircle className="h-5 w-5" />
          </div>
          <ThemeToggle compact />
        </div>
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Clinica Sorriso Feliz</p>
          <h1 className="mt-1 text-2xl font-semibold">Entrar no dashboard</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Use um usuario criado no Supabase Auth para acessar os dados reais protegidos por RLS.
          </p>
        </div>

        {params.error ? (
          <div className="mb-4 rounded-md bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-400/10 dark:text-rose-200">
            {params.error}
          </div>
        ) : null}

        <form action={signIn} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              className="mt-1 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Senha</span>
            <input
              required
              type="password"
              name="password"
              autoComplete="current-password"
              className="mt-1 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary"
            />
          </label>
          <button className="h-11 w-full rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:bg-cyan-800">
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}
