import { describe, expect, it } from "vitest";
import { synthesize } from "./local-analyst";
import type { ToolTrace } from "./types";

describe("synthesize", () => {
  it("grounds checkout evidence in tool results", () => {
    const traces: ToolTrace[] = [
      {
        name: "get_transaction_metrics",
        args: { hours: 6 },
        durationMs: 12,
        ok: true,
        result: {
          total: 1000,
          failed: 40,
          failureRate: 0.04,
          avgLatencyMs: 240,
          revenueUsd: 80_000,
          byChannel: [],
        },
      },
      {
        name: "get_transaction_metrics",
        args: { hours: 6, regionCode: "NG", providerSlug: "paystack" },
        durationMs: 9,
        ok: true,
        result: {
          total: 200,
          failed: 80,
          failureRate: 0.4,
          avgLatencyMs: 520,
          revenueUsd: 12_000,
          byChannel: [{ channel: "mobile", count: 140, failed: 70 }],
        },
      },
    ];
    const result = synthesize("Why did checkout failures increase this morning?", traces);
    expect(result.evidence.some((e) => e.title.includes("checkout") || e.title.includes("API"))).toBe(
      true,
    );
    expect(result.suggestedActions.some((a) => a.tool === "create_incident")).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.8);
  });
});
