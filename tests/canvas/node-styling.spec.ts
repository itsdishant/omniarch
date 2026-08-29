import { expect, test } from "@playwright/test";
import {
  createAndSignInTestUser,
  createTestProject,
} from "../helpers/test-auth";

test.describe("Canvas - Node Styling", () => {
  test("displays node color toolbar on selection and applies color theme", async ({
    page,
  }) => {
    await createAndSignInTestUser(page, { prefix: "node.style" });
    await createTestProject(page, "Node Styling Project");

    // Wait for canvas to load first
    await expect(
      page.getByRole("toolbar", { name: /shape tools/i }),
    ).toBeVisible({
      timeout: 15000,
    });

    // Import starter template
    await page.getByRole("button", { name: /templates/i }).click();
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await modal
      .getByRole("button", { name: /^import$/i })
      .first()
      .click();
    await expect(modal).not.toBeVisible();

    const node = page.locator(".react-flow__node").first();
    await expect(node).toBeVisible({ timeout: 15000 });

    // Click to select node
    await node.click();

    // NodeToolbar color swatches should appear in the toolbar portal
    const swatches = page.locator('button[aria-label$="node color"]');
    await expect(swatches.first()).toBeVisible({ timeout: 10000 });
    await expect(swatches).toHaveCount(8);

    // Click a distinct color swatch
    await swatches.nth(2).click();

    // Verify swatch is now active
    await expect(page.locator('button[aria-pressed="true"]')).toBeVisible();
  });
});
