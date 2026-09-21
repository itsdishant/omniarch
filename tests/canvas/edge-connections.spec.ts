import { expect, test } from "@playwright/test";
import {
  createAndSignInTestUser,
  createTestProject,
} from "../helpers/test-auth";

test.describe("Canvas - Edge Connections", () => {
  test("renders custom smoothstep edges with label badges and allows label editing", async ({
    page,
  }) => {
    await createAndSignInTestUser(page, { prefix: "edge.conn" });
    await createTestProject(page, "Edge Connections Project");

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

    // Verify edges are rendered
    const edges = page.locator(".react-flow__edge");
    await expect(edges.first()).toBeVisible({ timeout: 15000 });
    const initialEdgeCount = await edges.count();
    expect(initialEdgeCount).toBeGreaterThan(0);

    // Verify HTTP edge label badges exist
    const httpBadge = page.getByText("HTTP").first();
    await expect(httpBadge).toBeVisible();

    // Double click the label badge to edit label
    await httpBadge.dblclick();

    // Label input should appear
    const edgeInput = page.getByLabel("Edge label");
    await expect(edgeInput).toBeVisible();
    await edgeInput.fill("C:\\new-service");
    await edgeInput.press("Enter");

    await expect(page.getByText("C:\\new-service").first()).toBeVisible();
    await expect(page.getByText("C: ew-service")).toHaveCount(0);
  });
});
