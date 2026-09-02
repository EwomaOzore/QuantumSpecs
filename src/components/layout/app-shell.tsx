import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CommandPalette } from "@/components/layout/command-palette";
import type { ReactNode } from "react";
import { Suspense } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-qs-bg text-qs-text">
      <Suspense fallback={<aside className="h-full w-[220px] shrink-0 border-r border-qs-border bg-qs-bg-2" />}>
        <Sidebar />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="qs-scroll min-h-0 flex-1 overflow-auto">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}
