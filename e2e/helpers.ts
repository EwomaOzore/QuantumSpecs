import { expect, type Page } from "@playwright/test";

export async function login(page: Page) {
  await page.goto("/login");
  await page.locator("#email").fill("ewoma@kora.pay");
  await page.locator("#password").fill(process.env.CONSOLE_PASSWORD ?? "kora-ops");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).not.toHaveURL(/login/);
  await expect(page.getByText("Sign out")).toBeVisible();
}
