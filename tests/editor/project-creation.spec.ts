import { expect, test } from "@playwright/test";
import { createAndSignInTestUser } from "../helpers/test-auth";

test.describe("Editor - Project Creation", () => {
  test("creates project with name, previews room id, and navigates to workspace", async ({
    page,
  }) => {
    await createAndSignInTestUser(page, { prefix: "project.create" });

    // Click New Project button
    await page.getByRole("button", { name: /new project/i }).click();

    // Dialog should open
    await expect(
      page.getByRole("heading", { name: /create project/i }),
    ).toBeVisible();

    // Fill in project name
    const projectName = `Test Architecture ${Date.now()}`;
    await page.getByLabel(/project name/i).fill(projectName);

    // Room ID preview should appear
    const roomIdElement = page.locator("span.font-mono").first();
    await expect(roomIdElement).toBeVisible();
    const roomId = await roomIdElement.textContent();
    expect(roomId).toBeTruthy();
    expect(roomId).toMatch(/^test-architecture-.*-[a-z0-9]{16}$/);

    // Create button should be enabled
    const createBtn = page.getByRole("button", { name: /^create$/i });
    await expect(createBtn).toBeEnabled();
    await createBtn.click();

    // Should redirect to workspace
    await page.waitForURL(/\/editor\/[a-z0-9-]+$/);
    expect(page.url()).toMatch(/\/editor\/[a-z0-9-]+$/);

    // Navbar should show project name and workspace label
    await expect(
      page.getByRole("heading", { level: 1, name: new RegExp(projectName) }),
    ).toBeVisible();
    await expect(page.getByText("Workspace", { exact: true })).toBeVisible();

    // Canvas dots or React Flow wrapper should be visible
    await expect(
      page.locator(".react-flow, canvas, .canvas-dots").first(),
    ).toBeVisible();
  });
});
