import { expect, test } from "@playwright/test";
import { createAndSignInTestUser } from "../helpers/test-auth";

test.describe("API - Specs Endpoints", () => {
  test("fetches project specs list via REST API", async ({ page }) => {
    await createAndSignInTestUser(page, { prefix: "api.specs" });

    // Create a project
    const createRes = await page.request.post("/api/projects", {
      data: { name: `Specs API Project ${Date.now()}` },
    });
    const createdData = await createRes.json();
    const projectId = createdData.project.id;

    // Fetch specs list
    const specsRes = await page.request.get(`/api/projects/${projectId}/specs`);
    expect(specsRes.ok()).toBe(true);
    const body = await specsRes.json();
    expect(Array.isArray(body.specs)).toBe(true);
  });
});
