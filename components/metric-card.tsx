import type { LucideIcon } from "lucide-react";

export function MetricCard({
  title,
  value,
  helper,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  helper?: string;
  icon: LucideIcon;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          {helper ? <p className="mt-2 text-xs text-muted">{helper}</p> : null}
        </div>
        <div className="rounded-md bg-cyan-50 p-2 text-primary dark:bg-cyan-400/10">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </section>
  );
}
