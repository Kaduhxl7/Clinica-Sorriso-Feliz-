import Link from "next/link";
import { MessageCircle, LayoutDashboard, LogOut } from "lucide-react";
import { signOut } from "@/app/actions";
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
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-surface px-4 py-5 lg:block">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold leading-tight">Clinica Sorriso Feliz</p>
            <p className="text-xs text-muted">WhatsApp AI Agent</p>
          </div>
        </div>

        <nav className="mt-8 space-y-1">
          <Link className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-surface-muted" href="/">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-surface-muted"
            href="/conversations"
          >
            <MessageCircle className="h-4 w-4" />
            Conversas
          </Link>
        </nav>

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

      <main className="lg:pl-64">
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
            <Link className="rounded-md bg-surface-muted px-3 py-2 font-medium" href="/">
              Dashboard
            </Link>
            <Link className="rounded-md bg-surface-muted px-3 py-2 font-medium" href="/conversations">
              Conversas
            </Link>
          </nav>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
