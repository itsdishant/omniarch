import { expect, test } from "@playwright/test";
import {
  createAndSignInTestUser,
  createTestProject,
} from "../helpers/test-auth";

test.describe("Editor - Workspace Navbar", () => {
  test("displays project identity, actions, and close button in workspace", async ({
    page,
  }) => {
    await createAndSignInTestUser(page, { prefix: "navbar.test" });

    const projectName = `Navbar Workspace ${Date.now()}`;
    await createTestProject(page, projectName);

    // Verify project name heading and Workspace badge
    await expect(
      page.getByRole("heading", { level: 1, name: new RegExp(projectName) }),
    ).toBeVisible();
    await expect(page.getByText("Workspace", { exact: true })).toBeVisible();

    // Verify action buttons exist in navbar
    const templatesBtn = page.getByRole("button", { name: /templates/i });
    const shareBtn = page.getByRole("button", { name: /share/i });
    const aiBtn = page.getByRole("button", { name: /ai/i });
    const closeBtn = page.getByRole("button", { name: /close/i });

    await expect(templatesBtn).toBeVisible();
    await expect(shareBtn).toBeVisible();
    await expect(aiBtn).toBeVisible();
    await expect(closeBtn).toBeVisible();

    // In workspace mode, centered logo is hidden in favor of project title
    const workspaceHeader = page.locator("header");
    await expect(
      workspaceHeader.getByRole("heading", {
        level: 1,
        name: new RegExp(projectName),
      }),
    ).toBeVisible();
    await expect(workspaceHeader.getByLabel("OmniArch Logo")).toHaveCount(0);

    // Clicking Close returns to /editor home
    await closeBtn.click();
    await page.waitForURL(/\/editor($|\?)/);
    await expect(page).toHaveURL(/\/editor($|\?)/);

    // On editor home, project title and Workspace badge are absent
    await expect(
      page.getByRole("heading", {
        name: /create a project or open an existing one/i,
      }),
    ).toBeVisible();

    // On editor home, centered OmniArch logo is visible in the navbar
    const homeHeader = page.locator("header");
    const logo = homeHeader.getByLabel("OmniArch Logo");
    await expect(logo).toBeVisible();
    await expect(
      homeHeader.getByText("OmniArch", { exact: true }),
    ).toBeVisible();
  });
});
