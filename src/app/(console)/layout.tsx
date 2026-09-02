import { AppShell } from "@/components/layout/app-shell";
import type { ReactNode } from "react";
import { Suspense } from "react";

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <Suspense fallback={<div className="px-6 py-5 text-[13px] text-qs-muted">Loading…</div>}>
        {children}
      </Suspense>
    </AppShell>
  );
}
