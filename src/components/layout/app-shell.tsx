import { ShellFrame } from "@/components/layout/shell-frame";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return <ShellFrame>{children}</ShellFrame>;
}
