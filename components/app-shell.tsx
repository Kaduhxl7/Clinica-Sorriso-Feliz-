import Link from "next/link";
import { MessageCircle, LogOut } from "lucide-react";
import { signOut } from "@/app/actions";
import { SidebarNavLink } from "@/components/sidebar-nav-link";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string;
}) {
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-border bg-surface/95 px-4 py-5 backdrop-blur lg:block">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-soft">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold leading-tight">Clinica Sorriso Feliz</p>
            <p className="text-xs text-muted">Operations dashboard</p>
          </div>
        </div>

        <nav className="mt-8 space-y-1" aria-label="Navegacao principal">
          <SidebarNavLink href="/" icon="dashboard" label="Dashboard" />
          <SidebarNavLink href="/conversations" icon="conversations" label="Conversas" />
        </nav>

        <div className="mt-6 rounded-lg border border-border bg-surface-muted/70 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Realtime ativo</p>
          <p className="mt-1 text-sm leading-5 text-foreground/80">Novas mensagens atualizam conversas, metricas e graficos.</p>
        </div>

        <div className="absolute bottom-5 left-4 right-4 space-y-3">
          <p className="mb-3 truncate text-xs text-muted">{userEmail}</p>
          <ThemeToggle />
          <form action={signOut}>
            <button className="flex w-full items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-surface-muted">
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </form>
        </div>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="font-semibold">
              Clinica Sorriso Feliz
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle compact />
              <form action={signOut}>
                <button className="rounded-md border border-border px-3 py-2 text-sm font-medium">Sair</button>
              </form>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 text-sm">
            <Link className="rounded-md bg-surface-muted px-3 py-2 font-medium hover:bg-primary hover:text-white" href="/">
              Dashboard
            </Link>
            <Link className="rounded-md bg-surface-muted px-3 py-2 font-medium hover:bg-primary hover:text-white" href="/conversations">
              Conversas
            </Link>
          </nav>
        </header>
        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
