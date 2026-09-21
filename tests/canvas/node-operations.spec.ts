import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  createAndSignInTestUser,
  createTestProject,
} from "../helpers/test-auth";

async function importFirstTemplate(page: Page) {
  await expect(page.getByRole("toolbar", { name: /shape tools/i })).toBeVisible(
    {
      timeout: 15000,
    },
  );

  await page.getByRole("button", { name: /templates/i }).click();
  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible();
  await modal
    .getByRole("button", { name: /^import$/i })
    .first()
    .click();
  await expect(modal).not.toBeVisible();
}

async function editFirstNodeLabel(page: Page, firstNode: Locator) {
  await firstNode.click();
  await expect(firstNode).toHaveClass(/selected/);
  await firstNode.dblclick();
  const labelInput = firstNode.getByRole("textbox");
  await expect(labelInput).toBeVisible();
  return labelInput;
}

test.describe("Canvas - Node Operations", () => {
  test("selects, edits label inline, and deletes nodes on canvas", async ({
    page,
  }) => {
    await createAndSignInTestUser(page, { prefix: "node.ops" });
    await createTestProject(page, "Node Ops Project");
    await importFirstTemplate(page);

    const firstNode = page.locator(".react-flow__node").first();
    await expect(firstNode).toBeVisible({ timeout: 15000 });

    const labelInput = await editFirstNodeLabel(page, firstNode);
    await labelInput.fill("");
    await labelInput.press("Shift+Enter");
    await labelInput.press("Enter");
    await expect(firstNode).toContainText("Pill");

    const nextInput = await editFirstNodeLabel(page, firstNode);
    await nextInput.fill("Custom Microservice Node");
    await nextInput.press("Enter");

    await expect(firstNode).toContainText("Custom Microservice Node");

    const initialCount = await page.locator(".react-flow__node").count();

    await firstNode.click();
    await page.keyboard.press("Backspace");

    await expect(page.locator(".react-flow__node")).toHaveCount(
      initialCount - 1,
    );
  });

  test("commits Shift+Enter as a visible line break", async ({ page }) => {
    await createAndSignInTestUser(page, { prefix: "node.nl" });
    await createTestProject(page, "Node Newline Project");
    await importFirstTemplate(page);

    const firstNode = page.locator(".react-flow__node").first();
    await expect(firstNode).toBeVisible({ timeout: 15000 });

    const labelInput = await editFirstNodeLabel(page, firstNode);
    await labelInput.fill("Auth");
    await labelInput.press("Shift+Enter");
    await labelInput.pressSequentially("Service");
    await labelInput.press("Enter");

    await expect(firstNode).toContainText("Auth");
    await expect(firstNode).toContainText("Service");
    await expect(firstNode).not.toContainText("Auth\\nService");
  });

  test("renders escaped lowercase \\n as a line break", async ({ page }) => {
    await createAndSignInTestUser(page, { prefix: "node.esc.nl" });
    await createTestProject(page, "Node Escaped Newline Project");
    await importFirstTemplate(page);

    const firstNode = page.locator(".react-flow__node").first();
    await expect(firstNode).toBeVisible({ timeout: 15000 });

    const labelInput = await editFirstNodeLabel(page, firstNode);
    await labelInput.fill("gateway\\nroutes");
    await labelInput.press("Enter");

    await expect(firstNode).toContainText("gateway");
    await expect(firstNode).toContainText("routes");
    await expect(firstNode).not.toContainText("gateway\\nroutes");
  });

  test("preserves literal backslashes in technical labels", async ({
    page,
  }) => {
    await createAndSignInTestUser(page, { prefix: "node.path" });
    await createTestProject(page, "Node Path Project");
    await importFirstTemplate(page);

    const firstNode = page.locator(".react-flow__node").first();
    await expect(firstNode).toBeVisible({ timeout: 15000 });

    const labelInput = await editFirstNodeLabel(page, firstNode);
    await labelInput.fill("C:\\new-service");
    await labelInput.press("Enter");

    await expect(firstNode).toContainText("C:\\new-service");
    await expect(firstNode).not.toContainText("C: ew-service");
  });

  test("clips a long multiline label inside the node bounds", async ({
    page,
  }) => {
    await createAndSignInTestUser(page, { prefix: "node.overflow" });
    await createTestProject(page, "Node Overflow Project");
    await importFirstTemplate(page);

    const firstNode = page.locator(".react-flow__node").first();
    await expect(firstNode).toBeVisible({ timeout: 15000 });

    const labelInput = await editFirstNodeLabel(page, firstNode);
    await labelInput.fill("Line 1");
    for (let i = 2; i <= 12; i++) {
      await labelInput.press("Shift+Enter");
      await labelInput.pressSequentially(`Line ${i}`);
    }
    await labelInput.press("Enter");

    const nodeBox = await firstNode.boundingBox();
    const label = firstNode.locator("span").filter({ hasText: "Line 1" });
    await expect(label).toBeVisible();
    const labelBox = await label.boundingBox();
    expect(nodeBox).not.toBeNull();
    expect(labelBox).not.toBeNull();
    expect(labelBox!.height).toBeLessThanOrEqual(nodeBox!.height);
    expect(labelBox!.width).toBeLessThanOrEqual(nodeBox!.width);
  });
});
