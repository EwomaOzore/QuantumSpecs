"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Activity,
  Bot,
  FlaskConical,
  Globe2,
  LayoutDashboard,
  RadioTower,
  Settings,
  ShieldAlert,
  Users,
  Workflow,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Mark } from "@/components/ui/mark";

const NAV = [
  { href: "/", label: "Command", icon: LayoutDashboard, keepFilters: true },
  { href: "/globe", label: "Globe", icon: Globe2, keepFilters: true },
  { href: "/network", label: "Network", icon: RadioTower, keepFilters: true },
  { href: "/incidents", label: "Incidents", icon: ShieldAlert, keepFilters: true },
  { href: "/analytics", label: "Analytics", icon: Activity, keepFilters: false },
  { href: "/customers", label: "Customers", icon: Users, keepFilters: false },
  { href: "/agent", label: "AI Agent", icon: Bot, keepFilters: false },
  { href: "/workflows", label: "Workflows", icon: Workflow, keepFilters: false },
  { href: "/evaluation", label: "AI Evaluation", icon: FlaskConical, keepFilters: false },
  { href: "/settings", label: "Settings", icon: Settings, keepFilters: false },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const qs = params.toString();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-[min(220px,85vw)] flex-col border-r border-qs-border bg-qs-bg-2 transition-transform duration-200 lg:static lg:w-[220px] lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 px-4 py-4 hover:bg-qs-hover" aria-label="QuantumSpecs home">
          <Mark className="h-6 w-6 shrink-0 text-qs-accent" />
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold tracking-tight">QuantumSpecs</div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-qs-faint">Operations</div>
          </div>
        </Link>
        <button
          type="button"
          className="mr-2 rounded-md p-1.5 text-qs-muted hover:bg-qs-hover hover:text-qs-text lg:hidden"
          aria-label="Close navigation"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-auto px-2 py-1">
        {NAV.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          const href = item.keepFilters && qs ? `${item.href}?${qs}` : item.href;
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors lg:py-1.5",
                active
                  ? "bg-qs-elevated text-qs-text"
                  : "text-qs-muted hover:bg-qs-hover hover:text-qs-text",
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-qs-accent" : "text-qs-faint")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-qs-border px-4 py-3">
        <div className="text-[11px] uppercase tracking-[0.14em] text-qs-faint">Workspace</div>
        <div className="mt-1 text-[13px] text-qs-text">Kora · production</div>
        <div className="mt-0.5 text-[11px] text-qs-muted">21 cities · globe live</div>
        <nav aria-label="Related" className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-qs-muted">
          <Link href="/" className="hover:text-qs-text">
            Command
          </Link>
          <Link href="/globe" className="hover:text-qs-text">
            Globe
          </Link>
          <Link href="/network" className="hover:text-qs-text">
            Network
          </Link>
          <Link href="/incidents" className="hover:text-qs-text">
            Incidents
          </Link>
        </nav>
      </div>
    </aside>
  );
}
