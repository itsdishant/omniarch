import { expect, test } from "@playwright/test";
import {
  createAndSignInTestUser,
  createTestProject,
} from "../helpers/test-auth";

test.describe("Canvas - Starter Templates", () => {
  test("opens templates modal, previews starter architectures, and imports design into canvas", async ({
    page,
  }) => {
    await createAndSignInTestUser(page, { prefix: "templates.test" });
    await createTestProject(page, "Templates Test Project");

    // Wait for canvas to load first
    await expect(
      page.getByRole("toolbar", { name: /shape tools/i }),
    ).toBeVisible({
      timeout: 15000,
    });

    // Click Templates button in navbar
    const templatesButton = page.getByRole("button", { name: /templates/i });
    await expect(templatesButton).toBeVisible();
    await templatesButton.click();

    // Modal should open
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await expect(
      modal.getByRole("heading", { name: /import template/i }),
    ).toBeVisible();

    // Verify all 3 templates
    await expect(
      modal.getByRole("heading", { name: "Microservices" }),
    ).toBeVisible();
    await expect(
      modal.getByRole("heading", { name: "CI/CD Pipeline" }),
    ).toBeVisible();
    await expect(
      modal.getByRole("heading", { name: "Event-Driven System" }),
    ).toBeVisible();

    // Import Microservices template
    const importButtons = modal.getByRole("button", { name: /^import$/i });
    await expect(importButtons.first()).toBeVisible();
    await importButtons.first().click();

    // Modal should close
    await expect(modal).not.toBeVisible();

    // Canvas should now have nodes populated
    const nodes = page.locator(".react-flow__node");
    await expect(nodes.first()).toBeVisible({ timeout: 15000 });
    const count = await nodes.count();
    expect(count).toBeGreaterThan(0);
  });
});
