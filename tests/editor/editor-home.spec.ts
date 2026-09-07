import { expect, test } from "@playwright/test";
import { createAndSignInTestUser } from "../helpers/test-auth";

test.describe("Editor Home", () => {
  test("editor home renders empty state and action button for fresh user", async ({
    page,
  }) => {
    await createAndSignInTestUser(page, { prefix: "editor.home" });

    // Verify empty state message
    await expect(
      page.getByRole("heading", {
        name: /create a project or open an existing one/i,
      }),
    ).toBeVisible();

    // Verify New Project button is visible and enabled
    const newProjectBtn = page.getByRole("button", { name: /new project/i });
    await expect(newProjectBtn).toBeVisible();
    await expect(newProjectBtn).toBeEnabled();

    // Clicking New Project opens the creation dialog
    await newProjectBtn.click();
    await expect(
      page.getByRole("heading", { name: /create project/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/project name/i)).toBeVisible();
  });
});
