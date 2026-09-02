"use client";

import { Command } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useSyncExternalStore } from "react";
import { format } from "date-fns";
import { OPERATOR, TENANT } from "@/lib/constants";
import { NotificationTray } from "@/components/layout/notification-tray";

function subscribe(onStoreChange: () => void) {
  const id = setInterval(onStoreChange, 1000);
  return () => clearInterval(id);
}

function getSnapshot() {
  return Math.floor(Date.now() / 1000);
}

function getServerSnapshot() {
  return 0;
}

export function Topbar() {
  const epoch = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const now = epoch ? new Date(epoch * 1000) : null;
  const { data: session } = useSession();
  const operator = session?.user?.name?.split(" ")[0] ?? OPERATOR.name;

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-qs-border bg-qs-bg px-4">
      <div className="flex items-center gap-3 text-[12px] text-qs-muted">
        <span className="font-medium text-qs-text">{TENANT.name}</span>
        <span className="text-qs-faint">/</span>
        <span>{TENANT.environment}</span>
        <span className="hidden text-qs-faint sm:inline">· {session?.user?.role ?? OPERATOR.role}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-1.5 rounded-md border border-qs-border bg-qs-surface px-2 py-1 text-[11px] text-qs-faint md:flex">
          <Command className="h-3 w-3" />
          K to jump cities
        </div>
        <div className="font-mono text-[12px] tabular text-qs-muted">
          {now ? `${format(now, "HH:mm:ss")} UTC` : "—"}
        </div>
        <NotificationTray />
        <span className="hidden text-[12px] text-qs-muted sm:inline">{operator}</span>
        <button
          type="button"
          className="text-[12px] text-qs-faint hover:text-qs-text"
          onClick={() => void signOut({ callbackUrl: "/login" })}
        >
          Sign out
        </button>
        <div className="flex items-center gap-1.5 rounded-full border border-qs-border bg-qs-surface px-2 py-1 text-[11px]">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-qs-accent" />
          <span className="text-qs-muted">AI</span>
          <span className="text-qs-accent">live</span>
        </div>
      </div>
    </header>
  );
}
