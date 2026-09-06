import { afterEach, describe, expect, it } from "vitest";
import { analystModelLabel, paidAiEnabled } from "./policy";

const previousBilling = process.env.AI_BILLING;
const previousKey = process.env.OPENAI_API_KEY;

afterEach(() => {
  if (previousBilling === undefined) delete process.env.AI_BILLING;
  else process.env.AI_BILLING = previousBilling;
  if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = previousKey;
});

describe("paidAiEnabled", () => {
  it("stays off when a key is present but billing is not opted in", () => {
    process.env.OPENAI_API_KEY = "sk-test";
    delete process.env.AI_BILLING;
    expect(paidAiEnabled()).toBe(false);
    expect(analystModelLabel()).toBe("local-analyst");
  });

  it("stays off when billing is on but no key exists", () => {
    process.env.AI_BILLING = "1";
    delete process.env.OPENAI_API_KEY;
    expect(paidAiEnabled()).toBe(false);
  });

  it("turns on only with an explicit billing flag and a key", () => {
    process.env.AI_BILLING = "1";
    process.env.OPENAI_API_KEY = "sk-test";
    expect(paidAiEnabled()).toBe(true);
  });
});
