import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test("globe shows Earth and selects Lagos for Nigeria", async ({ page }) => {
  test.setTimeout(90_000);
  await login(page);
  await page.goto("/globe");
  await expect(page.getByRole("heading", { name: "Lagos" }).first()).toBeVisible({ timeout: 45_000 });
  await expect(page).toHaveURL(/city=lagos/);
  await expect(page.getByTestId("ops-globe").locator("canvas")).toBeVisible({ timeout: 45_000 });

  await page.goto("/globe?region=west-africa&city=accra");
  await expect(page.getByRole("heading", { name: "Accra" }).first()).toBeVisible({ timeout: 45_000 });
  await expect(page).toHaveURL(/city=accra/);

  await page.getByTestId("select-country-nigeria").first().click();
  await expect(page.getByRole("heading", { name: "Lagos" }).first()).toBeVisible({ timeout: 15_000 });
  await expect(page).toHaveURL(/city=lagos/);
  await expect(page).toHaveURL(/region=west-africa/);
});
