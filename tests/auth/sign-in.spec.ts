import { expect, test } from "@playwright/test";
import { setupClerkTestingToken, clerk } from "@clerk/testing/playwright";
import { DEFAULT_E2E_EMAIL } from "../helpers/test-auth";

test.describe("Authentication - Sign In", () => {
  test.beforeEach(async ({ page }) => {
    await setupClerkTestingToken({ page });
  });

  test("public sign-in page renders the Clerk auth form and controls", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await clerk.loaded({ page });

    await expect(page).toHaveTitle(/OmniArch/i);
    await expect(
      page.getByRole("heading", { name: /sign in to omniarch/i }),
    ).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^continue$/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /sign up/i })).toHaveAttribute(
      "href",
      /\/sign-up/,
    );
  });

  test("can navigate from sign-in to sign-up", async ({ page }) => {
    await page.goto("/sign-in");
    await clerk.loaded({ page });
    await page.getByRole("link", { name: /sign up/i }).click();

    await page.waitForURL(/\/sign-up/);
    await expect(
      page.getByRole("heading", { name: /create your account/i }),
    ).toBeVisible();
  });

  test("sign-in flow with valid credentials redirects to editor", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await clerk.loaded({ page });

    await clerk.signIn({
      emailAddress: DEFAULT_E2E_EMAIL,
      page,
    });

    await page.goto("/editor");
    await expect(page).toHaveURL(/\/editor($|\?)/);
  });
});
