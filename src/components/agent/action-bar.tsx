"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { SuggestedAction } from "@/lib/ai/types";

export function ActionBar({ actions }: { actions: SuggestedAction[] }) {
  const [done, setDone] = useState<Record<string, string>>({});
  const mutation = useMutation({
    mutationFn: async (action: SuggestedAction) => {
      const res = await fetch("/api/agent/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: action.tool, args: action.args }),
      });
      return res.json() as Promise<{ ok?: boolean; error?: string; id?: string; type?: string }>;
    },
    onSuccess: (data, action) => {
      setDone((prev) => ({
        ...prev,
        [action.id]: data.ok ? `Done${data.id ? ` · ${data.id}` : ""}` : data.error ?? "Failed",
      }));
    },
  });

  if (!actions.length) return null;

  return (
    <div className="mt-4">
      <div className="text-[11px] uppercase tracking-[0.14em] text-qs-faint">Suggested action</div>
      <div className="mt-2 grid gap-2">
        {actions.map((action) => (
          <div
            key={action.id}
            className="flex items-center justify-between gap-3 rounded-md border border-qs-border bg-qs-elevated px-3 py-2"
          >
            <div>
              <div className="text-[13px] text-qs-text">{action.label}</div>
              <div className="text-[12px] text-qs-muted">{action.description}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wide text-qs-faint">{action.risk}</span>
              {done[action.id] ? (
                <span className="text-[12px] text-qs-success">{done[action.id]}</span>
              ) : (
                <Button
                  variant={action.risk === "high" ? "warning" : "primary"}
                  size="sm"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate(action)}
                >
                  Execute
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
