import { expect, test } from "@playwright/test";
import { createAndSignInTestUser } from "../helpers/test-auth";

test.describe("Routing - Access Denied", () => {
  test("authenticated user accessing non-existent project sees Access Denied screen", async ({
    page,
  }) => {
    await createAndSignInTestUser(page, { prefix: "access.denied" });

    // Navigate to a non-existent project room
    await page.goto("/editor/non-existent-room-id-99999");

    // Should render AccessDenied component
    await expect(
      page.getByText(/you don't have access to this project/i),
    ).toBeVisible();

    // Link back to editor
    const backLink = page.getByRole("link", { name: /back to editor/i });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute("href", "/editor");

    // Clicking back link takes user to /editor
    await backLink.click();
    await page.waitForURL(/\/editor($|\?)/);
    await expect(page).toHaveURL(/\/editor($|\?)/);
  });
});
