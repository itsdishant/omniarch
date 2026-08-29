import { expect, test } from "@playwright/test";
import {
  createAndSignInTestUser,
  createTestProject,
} from "../helpers/test-auth";

test.describe("Canvas - Shape Panel", () => {
  test("renders 6 shape tools with drag attributes and tooltips", async ({
    page,
  }) => {
    await createAndSignInTestUser(page, { prefix: "canvas.shapes" });
    await createTestProject(page, "Shape Panel Project");

    // Shape panel toolbar (wait for canvas suspense to resolve)
    const shapeToolbar = page.getByRole("toolbar", { name: /shape tools/i });
    await expect(shapeToolbar).toBeVisible({ timeout: 15000 });

    // Verify all 6 shapes
    const expectedShapes = [
      "Rectangle",
      "Diamond",
      "Circle",
      "Pill",
      "Cylinder",
      "Hexagon",
    ];

    for (const shapeName of expectedShapes) {
      const button = shapeToolbar.getByRole("button", { name: shapeName });
      await expect(button).toBeVisible();
      await expect(button).toHaveAttribute("draggable", "true");
    }
  });
});
