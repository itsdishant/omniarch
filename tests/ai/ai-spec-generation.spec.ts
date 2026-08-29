import { expect, test } from "@playwright/test";
import {
  createAndSignInTestUser,
  createTestProject,
} from "../helpers/test-auth";

test.describe("AI - Specification Generation", () => {
  test("switches to Specs tab and displays generate spec action and empty state", async ({
    page,
  }) => {
    await createAndSignInTestUser(page, { prefix: "ai.spec" });
    await createTestProject(page, "AI Spec Generation Project");

    // Wait for canvas to load
    await expect(
      page.getByRole("toolbar", { name: /shape tools/i }),
    ).toBeVisible({
      timeout: 15000,
    });

    // Open AI sidebar
    await page.getByRole("button", { name: /open ai sidebar/i }).click();
    const aiDrawer = page.locator("aside", { hasText: "AI Workspace" });

    // Switch to Specs tab
    const specsTab = aiDrawer.getByRole("tab", { name: "Specs" });
    await expect(specsTab).toBeVisible();
    await specsTab.click();

    // Verify Generate spec button
    const generateBtn = aiDrawer.getByRole("button", {
      name: /^generate spec$/i,
    });
    await expect(generateBtn).toBeVisible();
    await expect(generateBtn).toBeEnabled();

    // Verify Project specs section
    await expect(aiDrawer.getByText("Project specs")).toBeVisible();
    await expect(
      aiDrawer.getByText("Generated specs will appear here."),
    ).toBeVisible();
  });
});
