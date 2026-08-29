import { expect, test } from "@playwright/test";
import { createAndSignInTestUser } from "../helpers/test-auth";

test.describe("API - Canvas Endpoints", () => {
  test("fetches and validates canvas persistence routes", async ({ page }) => {
    await createAndSignInTestUser(page, { prefix: "api.canvas" });

    // Create a project
    const createRes = await page.request.post("/api/projects", {
      data: { name: `Canvas API Project ${Date.now()}` },
    });
    const createdData = await createRes.json();
    const projectId = createdData.project.id;

    // 1. Initial GET should return null or canvas snapshot
    const getRes = await page.request.get(`/api/projects/${projectId}/canvas`);
    expect(getRes.ok()).toBe(true);
    const getData = await getRes.json();
    expect(getData).toHaveProperty("canvas");

    // 2. Reject invalid canvas payloads with 400
    const badPutRes = await page.request.put(
      `/api/projects/${projectId}/canvas`,
      { data: { nodes: "invalid-not-an-array", edges: [] } },
    );
    expect(badPutRes.status()).toBe(400);
  });
});
