import Link from "next/link";
import { BarChart3, Inbox, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateIcon = "chart" | "inbox" | "search";

const icons = {
  chart: BarChart3,
  inbox: Inbox,
  search: SearchX,
};

export function EmptyState({
  icon = "search",
  title,
  description,
  actionHref,
  actionLabel,
  compact = false,
}: {
  icon?: EmptyStateIcon;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  compact?: boolean;
}) {
  const Icon = icons[icon];

  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-muted/40 px-6 text-center",
        compact ? "py-8" : "py-12",
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-muted shadow-soft">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-md text-sm leading-6 text-muted">{description}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
