import { ActionBar } from "@/components/agent/action-bar";
import { ToolTraceList } from "@/components/agent/tool-trace";
import type { Investigation } from "@/lib/ai/types";

export function InvestigationReport({ investigation }: { investigation: Investigation }) {
  return (
    <div>
      <p className="text-[15px] leading-7 text-qs-text">{investigation.summary}</p>
      <div className="mt-4 flex gap-4 text-[11px] uppercase tracking-[0.12em] text-qs-faint">
        <span>Confidence {(investigation.confidence * 100).toFixed(0)}%</span>
        <span>{investigation.model}</span>
        <span className="tabular">{investigation.latencyMs}ms</span>
        <span className="tabular">
          {investigation.promptTokens + investigation.completionTokens} tokens
        </span>
      </div>
      <div className="mt-5">
        <div className="text-[11px] uppercase tracking-[0.14em] text-qs-faint">Evidence</div>
        <div className="mt-2 divide-y divide-qs-border rounded-md border border-qs-border">
          {investigation.evidence.map((item) => (
            <div key={item.title} className="flex items-start justify-between gap-4 px-3 py-2.5">
              <div>
                <div className="text-[13px] text-qs-text">{item.title}</div>
                <div className="mt-0.5 text-[12px] leading-5 text-qs-muted">{item.detail}</div>
              </div>
              {item.metric ? (
                <div className="shrink-0 font-mono text-[13px] tabular text-qs-accent">{item.metric}</div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
      <ActionBar actions={investigation.suggestedActions} />
      <ToolTraceList traces={investigation.toolCalls} />
    </div>
  );
}
