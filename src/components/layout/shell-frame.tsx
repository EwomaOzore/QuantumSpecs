"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Suspense } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CommandPalette } from "@/components/layout/command-palette";

export function ShellFrame({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  return (
    <div className="flex h-dvh overflow-hidden bg-qs-bg text-qs-text">
      {navOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/55 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setNavOpen(false)}
        />
      ) : null}
      <Suspense
        fallback={
          <aside className="hidden h-full w-[220px] shrink-0 border-r border-qs-border bg-qs-bg-2 lg:flex" />
        }
      >
        <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setNavOpen(true)} />
        <main className="qs-scroll min-h-0 flex-1 overflow-auto">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}
