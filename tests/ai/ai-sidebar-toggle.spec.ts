import { expect, test } from "@playwright/test";
import {
  createAndSignInTestUser,
  createTestProject,
} from "../helpers/test-auth";

test.describe("AI - Sidebar Drawer Toggle", () => {
  test("toggles AI sidebar open and closed from workspace navbar", async ({
    page,
  }) => {
    await createAndSignInTestUser(page, { prefix: "ai.toggle" });
    await createTestProject(page, "AI Sidebar Toggle Project");

    // Wait for canvas to be loaded
    await expect(
      page.getByRole("toolbar", { name: /shape tools/i }),
    ).toBeVisible({
      timeout: 15000,
    });

    const aiDrawer = page.locator("aside", { hasText: "AI Workspace" });
    const toggleAiBtn = page.getByRole("button", { name: /open ai sidebar/i });

    // Open AI sidebar
    await toggleAiBtn.click();
    await expect(aiDrawer).toBeVisible();
    await expect(
      aiDrawer.getByRole("heading", { name: "AI Workspace" }),
    ).toBeVisible();
    await expect(aiDrawer.getByText("Collaborate with OmniArch")).toBeVisible();

    // Close AI sidebar using the close button in drawer
    const closeBtn = aiDrawer.getByRole("button", {
      name: /close ai sidebar/i,
    });
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Drawer should have closed (or aria-hidden true)
    await expect(aiDrawer).toHaveAttribute("aria-hidden", "true");
  });
});
