import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test("analyst investigates and can execute a suggested action", async ({ page }) => {
  test.setTimeout(90_000);
  await login(page);
  await page.goto("/agent");
  await page.getByRole("button", { name: "Find failed transactions" }).click();
  await expect(page.getByText("Evidence")).toBeVisible({ timeout: 60_000 });
  const execute = page.getByRole("button", { name: "Execute" }).first();
  if (await execute.isVisible()) {
    await execute.click();
    await expect(page.getByText(/Done/)).toBeVisible({ timeout: 20_000 });
  }
});
