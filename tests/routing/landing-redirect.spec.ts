import { expect, test } from "@playwright/test";
import { createAndSignInTestUser } from "../helpers/test-auth";

test.describe("Routing - Landing Page Redirect", () => {
  test("unauthenticated access to / redirects to /sign-in", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/sign-in/);
    await expect(
      page.getByRole("heading", { name: /sign in to omniarch/i }),
    ).toBeVisible();
  });

  test("authenticated access to / redirects to /editor", async ({ page }) => {
    await createAndSignInTestUser(page, { prefix: "landing.auth" });

    await page.goto("/");

    await page.waitForURL(/\/editor($|\?)/);
    await expect(page).toHaveURL(/\/editor($|\?)/);
  });
});
