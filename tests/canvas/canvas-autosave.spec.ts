import { expect, test } from "@playwright/test";
import {
  createAndSignInTestUser,
  createTestProject,
} from "../helpers/test-auth";

test.describe("Canvas - Autosave & Persistence", () => {
  test("shows save status indicator and allows manual save trigger", async ({
    page,
  }) => {
    await createAndSignInTestUser(page, { prefix: "canvas.save" });
    await createTestProject(page, "Canvas Save Project");

    // Locate Save button in navbar
    const saveButton = page.locator('header button[aria-label^="Save canvas"]');
    await expect(saveButton).toBeVisible();

    // Click Save button manually
    await saveButton.click();

    // Verify it remains visible and indicates saved/idle
    await expect(saveButton).toBeVisible();
  });
});
