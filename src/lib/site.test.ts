import { describe, expect, it } from "vitest";
import { breadcrumbItems, findSitePage, pageMetadata } from "./site";

describe("page sources", () => {
  it("gives every listed route a unique title and description", () => {
    const globe = findSitePage("/globe");
    const command = findSitePage("/");
    expect(globe?.title).toBe("Globe");
    expect(command?.title).toBe("Command");
    expect(globe?.description).not.toBe(command?.description);
  });

  it("writes a canonical path into metadata", () => {
    const meta = pageMetadata("/network");
    expect(meta.alternates?.canonical).toBe("/network");
    expect(meta.title).toBe("Network");
  });

  it("builds breadcrumbs Command / Incidents / title", () => {
    const crumbs = breadcrumbItems("/incidents", { label: "Lagos tower sector down" });
    expect(crumbs.map((c) => c.name)).toEqual(["Command", "Incidents", "Lagos tower sector down"]);
  });
});
