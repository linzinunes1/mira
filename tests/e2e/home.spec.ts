import { test, expect } from "@playwright/test";

test.describe("Mira API — Homepage", () => {
  test("renders the home page with correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Mira API/i);
  });

  test("home page contains expected headings", async ({ page }) => {
    await page.goto("/");
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toContainText("Mira API");
  });

  test("home page description is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("p")).toContainText("Next.js App Router backend");
  });

  test("home page visual snapshot", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveScreenshot("home.png", { fullPage: true });
  });
});
