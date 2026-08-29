import { expect, test } from "@playwright/test";
import { setupClerkTestingToken, clerk } from "@clerk/testing/playwright";
import { createAndSignInTestUser } from "../helpers/test-auth";

test.describe("Authentication - Sign Up", () => {
  test.beforeEach(async ({ page }) => {
    await setupClerkTestingToken({ page });
  });

  test("public sign-up page renders the Clerk auth form", async ({ page }) => {
    await page.goto("/sign-up");
    await clerk.loaded({ page });

    await expect(page).toHaveTitle(/OmniArch/i);
    await expect(
      page.getByRole("heading", { name: /create your account/i }),
    ).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^continue$/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      /\/sign-in/,
    );
  });

  test("can navigate from sign-up to sign-in", async ({ page }) => {
    await page.goto("/sign-up");
    await clerk.loaded({ page });
    await page.getByRole("link", { name: /sign in/i }).click();

    await page.waitForURL(/\/sign-in/);
    await expect(
      page.getByRole("heading", { name: /sign in to omniarch/i }),
    ).toBeVisible();
  });

  test("authenticated user can access editor home", async ({ page }) => {
    await createAndSignInTestUser(page);
    await expect(
      page.getByRole("heading", {
        name: /create a project or open an existing one/i,
      }),
    ).toBeVisible();
  });
});
