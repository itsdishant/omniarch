import { expect, test } from "@playwright/test";
import {
  createAndSignInTestUser,
  createTestProject,
} from "../helpers/test-auth";

test.describe("AI - Architect Chat", () => {
  test("renders starter prompts, fills prompt on click, and accepts user architecture description", async ({
    page,
  }) => {
    await createAndSignInTestUser(page, { prefix: "ai.chat" });
    await createTestProject(page, "AI Architect Chat Project");

    // Wait for canvas to load
    await expect(
      page.getByRole("toolbar", { name: /shape tools/i }),
    ).toBeVisible({
      timeout: 15000,
    });

    // Open AI sidebar
    await page.getByRole("button", { name: /open ai sidebar/i }).click();
    const aiDrawer = page.locator("aside", { hasText: "AI Workspace" });

    // Verify AI Architect tab is selected
    const architectTab = aiDrawer.getByRole("tab", { name: "AI Architect" });
    await expect(architectTab).toBeVisible();
    await expect(architectTab).toHaveAttribute("data-state", "active");

    // Verify empty state starter prompts
    const ecommercePrompt = aiDrawer.getByRole("button", {
      name: "Design an e-commerce backend",
    });
    const chatAppPrompt = aiDrawer.getByRole("button", {
      name: "Create a chat app architecture",
    });
    const cicdPrompt = aiDrawer.getByRole("button", {
      name: "Build a CI/CD pipeline",
    });

    await expect(ecommercePrompt).toBeVisible();
    await expect(chatAppPrompt).toBeVisible();
    await expect(cicdPrompt).toBeVisible();

    const textarea = aiDrawer.getByPlaceholder("Describe your architecture...");
    await expect(textarea).toBeVisible();

    // Click starter prompt
    await ecommercePrompt.click();

    // Textarea should now contain the clicked prompt
    await expect(textarea).toHaveValue("Design an e-commerce backend");

    // Custom prompt editing
    await textarea.fill("Custom Payment Processing Architecture");
    await expect(textarea).toHaveValue(
      "Custom Payment Processing Architecture",
    );

    // Send button should be visible and enabled
    const sendButton = aiDrawer.getByRole("button", { name: "Send prompt" });
    await expect(sendButton).toBeVisible();
    await expect(sendButton).toBeEnabled();
  });
});
