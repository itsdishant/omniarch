import { expect, test } from "@playwright/test";
import {
  createAndSignInTestUser,
  createTestProject,
} from "../helpers/test-auth";

test.describe("Editor - Project Rename", () => {
  test("renames a project from the sidebar dialog", async ({ page }) => {
    await createAndSignInTestUser(page, { prefix: "project.rename" });

    const originalName = `Original Project ${Date.now()}`;
    await createTestProject(page, originalName);

    // Go back to editor home
    await page.getByRole("button", { name: /close/i }).click();
    await expect(page).toHaveURL(/\/editor($|\?)/);

    // Open sidebar
    await page.getByRole("button", { name: /open sidebar/i }).click();

    // Hover over project link to reveal action buttons
    const projectLink = page.getByRole("link", {
      name: new RegExp(originalName),
    });
    await expect(projectLink).toBeVisible();
    await projectLink.hover();

    // Click rename button
    const renameButton = page.getByRole("button", {
      name: new RegExp(`Rename ${originalName}`),
    });
    await expect(renameButton).toBeVisible();
    await renameButton.click();

    // Dialog should open
    await expect(
      page.getByRole("heading", { name: /rename project/i }),
    ).toBeVisible();
    await expect(
      page.getByText(new RegExp(`Current name: ${originalName}`)),
    ).toBeVisible();

    // Fill in new name
    const newName = `Updated Architecture ${Date.now()}`;
    const input = page.getByLabel(/project name/i);
    await input.clear();
    await input.fill(newName);

    // Click Rename
    await page.getByRole("button", { name: /^rename$/i }).click();

    // Sidebar should reflect updated name
    await expect(
      page.getByRole("link", { name: new RegExp(newName) }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: new RegExp(originalName) }),
    ).not.toBeVisible();
  });
});
