import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test("overview renders Kora command center", async ({ page }) => {
  await login(page);
  await page.goto("/");
  await expect(page.getByText("QuantumSpecs").first()).toBeVisible();
  await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible();
  await expect(page.getByText("AI detected unusual activity")).toBeVisible();
  await expect(page.getByRole("button", { name: "Simulate traffic" })).toBeVisible();
});
