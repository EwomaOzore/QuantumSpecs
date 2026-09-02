import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test("globe shows Earth and selects Lagos for Nigeria", async ({ page }) => {
  test.setTimeout(90_000);
  await login(page);
  await page.goto("/globe");
  await expect(page.getByRole("heading", { name: "Lagos" }).first()).toBeVisible({ timeout: 45_000 });
  await expect(page).toHaveURL(/city=lagos/);

  const globe = page.getByTestId("ops-globe");
  await expect(globe).toHaveAttribute("data-ready", "1", { timeout: 45_000 });
  await expect(globe).toHaveAttribute("data-countries", /1\d{2}/);
  await expect(globe.locator("canvas")).toBeVisible();

  await page.goto("/globe?region=west-africa&city=accra");
  await expect(page.getByRole("heading", { name: "Accra" }).first()).toBeVisible({ timeout: 45_000 });
  await expect(globe).toHaveAttribute("data-ready", "1", { timeout: 45_000 });
  await expect(globe).toHaveAttribute("data-countries", /1\d{2}/);

  const box = await globe.boundingBox();
  expect(box).toBeTruthy();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.up();
  await page.waitForTimeout(600);

  const x = Number(await globe.getAttribute("data-nigeria-x"));
  const y = Number(await globe.getAttribute("data-nigeria-y"));
  expect(x).toBeGreaterThan(40);
  expect(y).toBeGreaterThan(40);
  await page.mouse.click(box!.x + x, box!.y + y);

  await expect(page.getByRole("heading", { name: "Lagos" }).first()).toBeVisible({ timeout: 15_000 });
  await expect(page).toHaveURL(/city=lagos/);
  await expect(page).toHaveURL(/region=west-africa/);
});
