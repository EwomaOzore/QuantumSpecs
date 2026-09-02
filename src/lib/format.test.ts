import { describe, expect, it } from "vitest";
import { formatPercent, formatUsd, toUsd } from "./format";

describe("format", () => {
  it("formats percents and usd", () => {
    expect(formatPercent(18.4)).toBe("18.40%");
    expect(formatUsd(2400000)).toContain("2,400,000");
  });

  it("converts NGN to USD", () => {
    expect(toUsd(1580, "NGN")).toBeCloseTo(1, 5);
  });
});
