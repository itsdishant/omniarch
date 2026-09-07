import { expect, test } from "@playwright/test";
import {
  createAndSignInTestUser,
  createTestProject,
} from "../helpers/test-auth";

test.describe("Collaboration - Share Dialog", () => {
  test("opens share dialog, displays project owner, and copies workspace link", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    const { email } = await createAndSignInTestUser(page, {
      prefix: "collab.share",
    });
    await createTestProject(page, "Share Dialog Project");

    // Click Share button in workspace navbar
    const shareButton = page.getByRole("button", { name: /share/i });
    await expect(shareButton).toBeVisible();
    await shareButton.click();

    // Dialog should open
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("heading", { name: /share project/i }),
    ).toBeVisible();

    // Verify Owner row and badge
    await expect(dialog.getByText("OWNER")).toBeVisible();
    await expect(dialog.locator("li", { hasText: email })).toBeVisible();

    // Verify Copy Link button and feedback
    const copyLinkBtn = dialog.getByRole("button", { name: /copy link/i });
    await expect(copyLinkBtn).toBeVisible();
    await copyLinkBtn.click();
    await expect(
      dialog.getByRole("button", { name: /copied!/i }),
    ).toBeVisible();

    // Attempt to invite owner's own email should show validation error
    const inviteInput = dialog.getByPlaceholder(/teammate@company\.com/i);
    await inviteInput.fill(email);
    await dialog.getByRole("button", { name: /^invite$/i }).click();

    const alert = dialog.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/cannot invite the project owner/i);
  });
});
