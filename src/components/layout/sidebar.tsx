"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bot,
  FlaskConical,
  LayoutDashboard,
  Settings,
  ShieldAlert,
  Users,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Mark } from "@/components/ui/mark";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: Activity },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/incidents", label: "Incidents", icon: ShieldAlert },
  { href: "/agent", label: "AI Agent", icon: Bot },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/evaluation", label: "AI Evaluation", icon: FlaskConical },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-qs-border bg-qs-bg-2">
      <div className="flex items-center gap-2.5 px-4 py-4">
        <Mark className="h-6 w-6 text-qs-accent" />
        <div>
          <div className="text-[13px] font-semibold tracking-tight">QuantumSpecs</div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-qs-faint">Operations</div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-2 py-1">
        {NAV.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                active
                  ? "bg-qs-elevated text-qs-text"
                  : "text-qs-muted hover:bg-qs-hover hover:text-qs-text",
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-qs-accent" : "text-qs-faint")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-qs-border px-4 py-3">
        <div className="text-[11px] uppercase tracking-[0.14em] text-qs-faint">Workspace</div>
        <div className="mt-1 text-[13px] text-qs-text">Kora · production</div>
        <div className="mt-0.5 text-[11px] text-qs-muted">5 regions live</div>
      </div>
    </aside>
  );
}
