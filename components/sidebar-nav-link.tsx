"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SidebarNavLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
        active
          ? "bg-primary text-white shadow-soft"
          : "text-foreground/80 hover:bg-surface-muted hover:text-foreground",
      )}
      href={href}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
