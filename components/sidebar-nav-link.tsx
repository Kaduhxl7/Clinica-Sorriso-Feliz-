"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type SidebarNavIcon = "dashboard" | "conversations";

const icons = {
  dashboard: LayoutDashboard,
  conversations: MessageCircle,
};

export function SidebarNavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: SidebarNavIcon;
  label: string;
}) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  const Icon = icons[icon];

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
