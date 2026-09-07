import { expect, test } from "@playwright/test";
import {
  createAndSignInTestUser,
  createTestProject,
} from "../helpers/test-auth";

test.describe("Editor - Project Sidebar", () => {
  test("toggles sidebar drawer, switches tabs, and navigates between projects", async ({
    page,
  }) => {
    await createAndSignInTestUser(page, { prefix: "project.sidebar" });

    // Create first project
    const project1 = `Sidebar Project Alpha ${Date.now()}`;
    await createTestProject(page, project1);

    // Go back to editor home
    await page.getByRole("button", { name: /close/i }).click();
    await expect(page).toHaveURL(/\/editor($|\?)/);

    // Create second project
    const project2 = `Sidebar Project Beta ${Date.now()}`;
    await createTestProject(page, project2);

    // Open sidebar
    const toggleButton = page.getByRole("button", { name: /open sidebar/i });
    await toggleButton.click();

    // Verify tabs
    const myProjectsTab = page.getByRole("tab", { name: /my projects/i });
    const sharedTab = page.getByRole("tab", { name: /^shared$/i });
    await expect(myProjectsTab).toBeVisible();
    await expect(sharedTab).toBeVisible();

    // Switch to Shared tab and verify empty state
    await sharedTab.click();
    await expect(
      page.getByText(/no shared projects|projects shared with you/i),
    ).toBeVisible();

    // Switch back to My Projects tab
    await myProjectsTab.click();

    // Both projects should be in list
    const link1 = page.getByRole("link", { name: new RegExp(project1) });
    const link2 = page.getByRole("link", { name: new RegExp(project2) });
    await expect(link1).toBeVisible();
    await expect(link2).toBeVisible();

    // Click first project to navigate
    await link1.click();
    await page.waitForURL(/\/editor\/[a-z0-9-]+$/);

    // Verify project 1 is active
    await expect(
      page.getByRole("heading", { level: 1, name: new RegExp(project1) }),
    ).toBeVisible();
  });
});
