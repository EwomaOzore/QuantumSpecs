import { describe, expect, it } from "vitest";
import { planTools } from "./plan";

describe("planTools", () => {
  it("investigates a checkout spike with metrics, deploy and logs", () => {
    const plan = planTools("Why did checkout failures increase this morning?");
    const names = plan.map((p) => p.name);
    expect(names).toContain("get_transaction_metrics");
    expect(names).toContain("get_deployment");
    expect(names).toContain("query_logs");
  });

  it("compares regions for Nigeria vs Ghana", () => {
    const plan = planTools("Compare Nigeria vs Ghana");
    expect(plan.some((p) => p.name === "compare_regions")).toBe(true);
  });

  it("does not auto-execute write tools", () => {
    const plan = planTools("Create incident and rollback deployment");
    expect(plan.every((p) => !["create_incident", "rollback_deployment"].includes(p.name))).toBe(
      true,
    );
  });
});
