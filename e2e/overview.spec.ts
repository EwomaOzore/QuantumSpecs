import { test, expect } from "@playwright/test";

test("overview renders Kora command center", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("QuantumSpecs")).toBeVisible();
  await expect(page.getByText(/Good (morning|afternoon|evening)/)).toBeVisible();
  await expect(page.getByText("AI detected unusual activity")).toBeVisible();
});
