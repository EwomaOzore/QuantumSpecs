import { describe, expect, it } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  it("allows traffic under the cap and blocks after", () => {
    const key = `test-${Math.random()}`;
    const now = 1_000_000;
    expect(rateLimit(key, 2, 1000, now).ok).toBe(true);
    expect(rateLimit(key, 2, 1000, now + 10).ok).toBe(true);
    expect(rateLimit(key, 2, 1000, now + 20).ok).toBe(false);
    expect(rateLimit(key, 2, 1000, now + 1010).ok).toBe(true);
  });
});
