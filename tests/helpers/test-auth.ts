import { expect, type Page } from "@playwright/test";
import { setupClerkTestingToken, clerk } from "@clerk/testing/playwright";

export interface TestUserCredentials {
  email: string;
  password: string;
}

export const DEFAULT_E2E_EMAIL = "omniarch.e2e.runner+clerk_test@example.com";
export const DEFAULT_E2E_PASSWORD = "OmniArch_E2ERunner_#9xZ$2026!";

export async function createAndSignInTestUser(
  page: Page,
  _options: { prefix?: string } = {},
): Promise<TestUserCredentials> {
  await setupClerkTestingToken({ page });
  await page.goto("/sign-in");
  await clerk.loaded({ page });

  await clerk.signIn({
    emailAddress: DEFAULT_E2E_EMAIL,
    page,
  });

  await page.goto("/editor");
  await expect(page).toHaveURL(/\/editor($|\?)/);

  return { email: DEFAULT_E2E_EMAIL, password: DEFAULT_E2E_PASSWORD };
}

export async function createTestProject(
  page: Page,
  name?: string,
): Promise<{ projectName: string; roomId: string }> {
  const projectName = name ?? `Test Project ${Date.now()}`;
  await page.getByRole("button", { name: /new project/i }).click();
  await page.getByLabel(/project name/i).fill(projectName);

  // Click create button
  await page.getByRole("button", { name: /^create$/i }).click();

  // Wait for redirect to /editor/[roomId]
  await page.waitForURL(/\/editor\/[a-z0-9-]+$/, { timeout: 20000 });

  const url = page.url();
  const roomId = url.split("/").pop() || "";

  return { projectName, roomId };
}
