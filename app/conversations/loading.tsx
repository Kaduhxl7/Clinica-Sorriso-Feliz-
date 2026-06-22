export default function ConversationsLoading() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-6 rounded-xl border border-border bg-surface p-5 shadow-soft sm:p-6">
          <div className="h-4 w-32 animate-pulse rounded bg-surface-muted" />
          <div className="mt-4 h-8 w-56 animate-pulse rounded bg-surface-muted" />
          <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-surface-muted" />
        </div>

        <div className="mb-5 rounded-lg border border-border bg-surface p-4 shadow-soft">
          <div className="mb-4 h-5 w-44 animate-pulse rounded bg-surface-muted" />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-11 animate-pulse rounded-md bg-surface-muted" />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3 shadow-soft">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="border-b border-border px-3 py-4 last:border-b-0">
              <div className="h-4 w-48 animate-pulse rounded bg-surface-muted" />
              <div className="mt-3 flex gap-2">
                <div className="h-6 w-24 animate-pulse rounded-full bg-surface-muted" />
                <div className="h-6 w-24 animate-pulse rounded-full bg-surface-muted" />
                <div className="h-6 w-24 animate-pulse rounded-full bg-surface-muted" />
              </div>
              <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-surface-muted" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
