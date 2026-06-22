import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type MetricTone = "default" | "success" | "warning" | "danger" | "info";

const toneClasses: Record<MetricTone, string> = {
  default: "bg-cyan-50 text-primary dark:bg-cyan-400/10",
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200",
  danger: "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200",
  info: "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-200",
};

export function MetricCard({
  title,
  value,
  helper,
  icon: Icon,
  tone = "default",
}: {
  title: string;
  value: number | string;
  helper?: string;
  icon: LucideIcon;
  tone?: MetricTone;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          {helper ? <p className="mt-2 max-w-[16rem] text-xs leading-5 text-muted">{helper}</p> : null}
        </div>
        <div className={cn("rounded-lg p-2.5", toneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </section>
  );
}
