"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[18vh]" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-lg rounded-lg border border-qs-border bg-qs-surface p-3 shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = value.trim();
            if (!q) return;
            setOpen(false);
            router.push(`/agent?q=${encodeURIComponent(q)}`);
          }}
        >
          <div className="text-[11px] uppercase tracking-[0.14em] text-qs-faint">Ask QuantumSpecs</div>
          <Input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Why did checkout failures increase this morning?"
            className="mt-2 h-10"
          />
        </form>
        <div className="mt-2 text-[11px] text-qs-faint">Enter to investigate with live Kora tools</div>
      </div>
    </div>
  );
}
