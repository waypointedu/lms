import { test, expect } from "@playwright/test";

test("home loads and shows hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Waypoint LMS/i })).toBeVisible();
});

test("courses page renders and filters", async ({ page }) => {
  await page.goto("/courses");
  await expect(page.getByRole("heading", { name: /Course catalog/i })).toBeVisible();
  await page.selectOption("select#language", "es");
  await page.getByRole("button", { name: /Apply/ }).click();
  await expect(page.getByText(/Fundamentos Waypoint/i)).toBeVisible();
});

test("search overlay opens", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Search/i }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Search").fill("Waypoint");
  await expect(page.getByText(/Type to search/i)).not.toBeVisible();
});
