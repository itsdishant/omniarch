import { expect, test } from "@playwright/test";
import {
  createAndSignInTestUser,
  createTestProject,
} from "../helpers/test-auth";

test.describe("Editor - Project Deletion", () => {
  test("deletes a project from the sidebar and removes it from list", async ({
    page,
  }) => {
    await createAndSignInTestUser(page, { prefix: "project.delete" });

    const projectName = `Project To Delete ${Date.now()}`;
    await createTestProject(page, projectName);

    // Go back to editor home
    await page.getByRole("button", { name: /close/i }).click();
    await expect(page).toHaveURL(/\/editor($|\?)/);

    // Open sidebar
    await page.getByRole("button", { name: /open sidebar/i }).click();

    // Hover over project link
    const projectLink = page.getByRole("link", {
      name: new RegExp(projectName),
    });
    await expect(projectLink).toBeVisible();
    await projectLink.hover();

    // Click delete button
    const deleteButton = page.getByRole("button", {
      name: new RegExp(`Delete ${projectName}`),
    });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // Delete confirmation dialog
    const deleteDialog = page.getByRole("dialog");
    await expect(deleteDialog).toBeVisible();
    await expect(
      deleteDialog.getByRole("heading", { name: /delete project/i }),
    ).toBeVisible();
    await expect(
      deleteDialog.getByText(/This cannot be undone/i),
    ).toBeVisible();

    // Confirm deletion
    await deleteDialog.getByRole("button", { name: /^delete$/i }).click();

    // Project should disappear from sidebar
    await expect(
      page.getByRole("link", { name: new RegExp(projectName) }),
    ).not.toBeVisible();
  });
});
