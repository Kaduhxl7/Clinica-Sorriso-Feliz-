export default function Loading() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-xl border border-border bg-surface p-6 shadow-soft">
          <div className="h-4 w-40 animate-pulse rounded bg-surface-muted" />
          <div className="mt-4 h-8 w-72 max-w-full animate-pulse rounded bg-surface-muted" />
          <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-surface-muted" />
        </div>
        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="rounded-lg border border-border bg-surface p-5 shadow-soft">
              <div className="h-4 w-28 animate-pulse rounded bg-surface-muted" />
              <div className="mt-4 h-9 w-20 animate-pulse rounded bg-surface-muted" />
              <div className="mt-3 h-3 w-40 animate-pulse rounded bg-surface-muted" />
            </div>
          ))}
        </div>
        <div className="grid gap-5 xl:grid-cols-3">
          <div className="h-80 rounded-lg border border-border bg-surface p-5 shadow-soft xl:col-span-2">
            <div className="h-full animate-pulse rounded bg-surface-muted" />
          </div>
          <div className="h-80 rounded-lg border border-border bg-surface p-5 shadow-soft">
            <div className="h-full animate-pulse rounded bg-surface-muted" />
          </div>
        </div>
      </div>
    </main>
  );
}
