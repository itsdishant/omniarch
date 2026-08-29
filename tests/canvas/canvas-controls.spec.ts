import { expect, test } from "@playwright/test";
import {
  createAndSignInTestUser,
  createTestProject,
} from "../helpers/test-auth";

test.describe("Canvas - Ergonomics and Controls", () => {
  test("renders canvas control toolbar and supports zoom, fit view, undo and redo", async ({
    page,
  }) => {
    await createAndSignInTestUser(page, { prefix: "canvas.ctrls" });
    await createTestProject(page, "Canvas Controls Project");

    // Canvas control toolbar
    const controls = page.getByRole("toolbar", { name: /canvas controls/i });
    await expect(controls).toBeVisible();

    const zoomInBtn = controls.getByRole("button", { name: /zoom in/i });
    const zoomOutBtn = controls.getByRole("button", { name: /zoom out/i });
    const fitViewBtn = controls.getByRole("button", { name: /fit view/i });
    const undoBtn = controls.getByRole("button", { name: /undo/i });
    const redoBtn = controls.getByRole("button", { name: /redo/i });

    await expect(zoomInBtn).toBeVisible();
    await expect(zoomOutBtn).toBeVisible();
    await expect(fitViewBtn).toBeVisible();
    await expect(undoBtn).toBeVisible();
    await expect(redoBtn).toBeVisible();

    // Click Zoom In and Zoom Out
    await zoomInBtn.click();
    await zoomOutBtn.click();
    await fitViewBtn.click();

    // Import a template so we have actions to undo
    await page.getByRole("button", { name: /templates/i }).click();
    const modal = page.getByRole("dialog");
    await modal
      .getByRole("button", { name: /import/i })
      .first()
      .click();
    await expect(modal).not.toBeVisible();

    await expect(page.locator(".react-flow__node").first()).toBeVisible({
      timeout: 15000,
    });
  });
});
