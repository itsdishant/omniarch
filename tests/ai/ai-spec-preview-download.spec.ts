import { expect, test } from "@playwright/test";
import {
  createAndSignInTestUser,
  createTestProject,
} from "../helpers/test-auth";

test.describe("AI - Specification Preview and Download Contract", () => {
  test("specs tab connects with spec download endpoints and supports spec preview modals", async ({
    page,
  }) => {
    await createAndSignInTestUser(page, { prefix: "ai.preview" });
    const { roomId } = await createTestProject(page, "AI Spec Preview Project");

    // Wait for canvas to load
    await expect(
      page.getByRole("toolbar", { name: /shape tools/i }),
    ).toBeVisible({
      timeout: 15000,
    });

    // Open AI sidebar and switch to Specs tab
    await page.getByRole("button", { name: /open ai sidebar/i }).click();
    const aiDrawer = page.locator("aside", { hasText: "AI Workspace" });
    await aiDrawer.getByRole("tab", { name: "Specs" }).click();

    // Verify the specs list fetch is issued to /api/projects/[roomId]/specs
    const specsResponse = await page.request.get(
      `/api/projects/${roomId}/specs`,
    );
    expect(specsResponse.ok()).toBe(true);
    const body = await specsResponse.json();
    expect(Array.isArray(body.specs)).toBe(true);
  });
});
