import { AppShell } from "@/components/layout/app-shell";
import { PageLoader } from "@/components/ui/page-loader";
import type { ReactNode } from "react";
import { Suspense } from "react";

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </AppShell>
  );
}
