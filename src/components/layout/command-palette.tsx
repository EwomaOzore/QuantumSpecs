"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { OPS_HUBS } from "@/lib/ops-geo";
import { filtersHref } from "@/lib/ops-filters";

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

  const q = value.trim().toLowerCase();
  const places = useMemo(() => {
    if (!q) return OPS_HUBS.filter((h) => h.isHub);
    return OPS_HUBS.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.country.toLowerCase().includes(q) ||
        h.region.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [q]);

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
            const text = value.trim();
            if (!text) return;
            const lowered = text.toLowerCase();
            const exact =
              OPS_HUBS.find((h) => h.name.toLowerCase() === lowered || h.country.toLowerCase() === lowered) ??
              OPS_HUBS.find((h) => h.region.toLowerCase() === lowered && h.isHub) ??
              OPS_HUBS.find((h) => h.region.toLowerCase() === lowered && h.isPrimary);
            setOpen(false);
            if (exact) {
              router.push(filtersHref("/globe", { region: exact.regionSlug, city: exact.slug }));
              return;
            }
            router.push(`/agent?q=${encodeURIComponent(text)}`);
          }}
        >
          <div className="text-[11px] uppercase tracking-[0.14em] text-qs-faint">Jump or investigate</div>
          <Input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Lagos, West Africa, or ask the analyst…"
            className="mt-2 h-10"
          />
        </form>
        <div className="mt-2 max-h-64 overflow-auto">
          {places.map((hub) => (
            <button
              key={hub.slug}
              type="button"
              className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-[13px] hover:bg-qs-hover"
              onClick={() => {
                setOpen(false);
                router.push(filtersHref("/globe", { region: hub.regionSlug, city: hub.slug }));
              }}
            >
              <span>
                {hub.name}
                <span className="text-qs-muted"> · {hub.country}</span>
              </span>
              <span className="text-[11px] text-qs-faint">{hub.region}</span>
            </button>
          ))}
        </div>
        <div className="mt-2 text-[11px] text-qs-faint">Enter a city to fly the globe, or a question for the analyst</div>
      </div>
    </div>
  );
}
