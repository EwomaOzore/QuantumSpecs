import { describe, expect, it } from "vitest";
import { matchTrigger, type OpsSnapshot } from "./workflows";

const quiet: OpsSnapshot = {
  last10mFailureRate: 0.02,
  last10mTotal: 40,
  last6hFailureRate: 0.02,
  ngPaystackFailRate: 0.02,
  maxProviderLatencyMs: 240,
  highRiskFailCount: 0,
  utcHour: 14,
  recentFailedDeploy: false,
};

describe("matchTrigger", () => {
  it("fires checkout paging when error rate is up", () => {
    const result = matchTrigger("metric.checkout.failure_rate > 0.05 for 10m", {
      ...quiet,
      last10mFailureRate: 0.11,
      last10mTotal: 40,
    });
    expect(result.matched).toBe(true);
  });

  it("stays quiet on a healthy window", () => {
    const result = matchTrigger("metric.checkout.failure_rate > 0.05 for 10m", quiet);
    expect(result.matched).toBe(false);
  });

  it("matches nightly recon in the WAT window", () => {
    expect(matchTrigger("cron 01:30 WAT", { ...quiet, utcHour: 0 }).matched).toBe(true);
    expect(matchTrigger("cron 01:30 WAT", quiet).matched).toBe(false);
  });
});
