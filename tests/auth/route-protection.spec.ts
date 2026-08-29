import { expect, test } from "@playwright/test";

test.describe("Authentication - Route Protection", () => {
  test("unauthenticated access to /editor redirects to sign-in with redirect_url", async ({
    page,
  }) => {
    await page.goto("/editor");

    await expect(page).toHaveURL(/\/sign-in\?redirect_url=/);
    await expect(
      page.getByRole("heading", { name: /sign in to omniarch/i }),
    ).toBeVisible();
  });

  test("unauthenticated access to /editor/[roomId] redirects to sign-in", async ({
    page,
  }) => {
    await page.goto("/editor/non-existent-room-12345");

    await expect(page).toHaveURL(/\/sign-in\?redirect_url=/);
    expect(page.url()).toContain("non-existent-room-12345");
  });
});
