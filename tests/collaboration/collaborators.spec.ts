import { expect, test } from "@playwright/test";
import {
  createAndSignInTestUser,
  createTestProject,
} from "../helpers/test-auth";

test.describe("Collaboration - Collaborators Management", () => {
  test("invites collaborator by email and removes collaborator access", async ({
    page,
  }) => {
    await createAndSignInTestUser(page, { prefix: "collab.manage" });
    await createTestProject(page, "Collaborators Project");

    // Open share dialog
    await page.getByRole("button", { name: /share/i }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Invite collaborator
    const collabEmail = `collab.${Date.now()}@example.com`;
    const inviteInput = dialog.getByPlaceholder(/teammate@company\.com/i);
    await inviteInput.fill(collabEmail);

    const inviteBtn = dialog.getByRole("button", { name: /^invite$/i });
    await expect(inviteBtn).toBeEnabled();
    await inviteBtn.click();

    // Verify collaborator row appears with badge
    const collabRow = dialog.locator("li", { hasText: collabEmail });
    await expect(collabRow).toBeVisible({ timeout: 10000 });
    await expect(collabRow.getByText("COLLABORATOR")).toBeVisible();

    // Remove collaborator
    const removeBtn = dialog.getByRole("button", {
      name: new RegExp(`Remove ${collabEmail}`),
    });
    await expect(removeBtn).toBeVisible();
    await removeBtn.click();

    // Verify collaborator row is removed
    await expect(collabRow).not.toBeVisible();
  });
});
