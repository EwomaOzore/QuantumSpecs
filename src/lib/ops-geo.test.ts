import { describe, expect, it } from "vitest";
import { normalizeCountryName, primaryHubForCountry } from "./ops-geo";

describe("normalizeCountryName", () => {
  it("maps Natural Earth labels onto the hub list", () => {
    expect(normalizeCountryName("United States of America")).toBe("United States");
    expect(normalizeCountryName("United Republic of Tanzania")).toBe("Tanzania");
    expect(normalizeCountryName("Ivory Coast")).toBe("Côte d'Ivoire");
  });

  it("selects Lagos as Nigeria's primary hub", () => {
    expect(primaryHubForCountry("Nigeria")?.slug).toBe("lagos");
    expect(primaryHubForCountry("United States of America")?.slug).toBe("atlanta");
    expect(primaryHubForCountry("United Republic of Tanzania")?.slug).toBe("dar-es-salaam");
  });
});
