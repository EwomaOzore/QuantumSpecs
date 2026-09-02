import { Badge } from "@/components/ui/badge";
import type { ToolTrace } from "@/lib/ai/types";

export function ToolTraceList({ traces }: { traces: ToolTrace[] }) {
  if (!traces.length) return null;
  return (
    <div className="mt-4">
      <div className="text-[11px] uppercase tracking-[0.14em] text-qs-faint">Tool calls</div>
      <div className="mt-2 space-y-1.5">
        {traces.map((trace, i) => (
          <div
            key={`${trace.name}-${i}`}
            className="flex items-center justify-between rounded-md border border-qs-border px-3 py-1.5 font-mono text-[11px]"
          >
            <div className="min-w-0 truncate text-qs-text">
              {trace.name}
              <span className="ml-2 text-qs-faint">
                {Object.entries(trace.args)
                  .map(([k, v]) => `${k}=${String(v)}`)
                  .join(" ")}
              </span>
            </div>
            <div className="ml-3 flex items-center gap-2">
              <span className="tabular text-qs-muted">{trace.durationMs}ms</span>
              <Badge tone={trace.ok ? "success" : "danger"}>{trace.ok ? "ok" : "fail"}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
