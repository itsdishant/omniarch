import { expect, test } from "@playwright/test";
import {
  createAndSignInTestUser,
  createTestProject,
} from "../helpers/test-auth";

test.describe("Canvas - Node Operations", () => {
  test("selects, edits label inline, and deletes nodes on canvas", async ({
    page,
  }) => {
    await createAndSignInTestUser(page, { prefix: "node.ops" });
    await createTestProject(page, "Node Ops Project");

    // Wait for canvas to load first
    await expect(
      page.getByRole("toolbar", { name: /shape tools/i }),
    ).toBeVisible({
      timeout: 15000,
    });

    // Import starter template to get test nodes
    await page.getByRole("button", { name: /templates/i }).click();
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await modal
      .getByRole("button", { name: /^import$/i })
      .first()
      .click();
    await expect(modal).not.toBeVisible();

    // Find first node
    const firstNode = page.locator(".react-flow__node").first();
    await expect(firstNode).toBeVisible({ timeout: 15000 });

    // Click node to select it
    await firstNode.click();
    await expect(firstNode).toHaveClass(/selected/);

    // Double click to trigger inline editing
    await firstNode.dblclick();

    // Input should appear
    const labelInput = firstNode.locator("input");
    await expect(labelInput).toBeVisible();
    await labelInput.fill("Custom Microservice Node");
    await labelInput.press("Enter");

    // Verify updated label
    await expect(firstNode).toContainText("Custom Microservice Node");

    // Count initial nodes
    const initialCount = await page.locator(".react-flow__node").count();

    // Select and press Backspace to delete
    await firstNode.click();
    await page.keyboard.press("Backspace");

    // Node count should decrease
    await expect(page.locator(".react-flow__node")).toHaveCount(
      initialCount - 1,
    );
  });
});
