import { expect, test } from "@playwright/test";
import { createAndSignInTestUser } from "../helpers/test-auth";

test.describe("API - Projects Endpoints", () => {
  test("creates, reads, updates, and deletes projects via REST API", async ({
    page,
  }) => {
    await createAndSignInTestUser(page, { prefix: "api.projects" });

    // 1. Create project via POST
    const initialName = `API Project ${Date.now()}`;
    const createRes = await page.request.post("/api/projects", {
      data: { name: initialName },
    });
    expect(createRes.status()).toBe(201);
    const createdData = await createRes.json();
    expect(createdData.project.name).toBe(initialName);
    expect(createdData.project.id).toBeTruthy();
    const projectId = createdData.project.id;

    // 2. Fetch project list via GET
    const listRes = await page.request.get("/api/projects");
    expect(listRes.ok()).toBe(true);
    const listData = await listRes.json();
    expect(Array.isArray(listData.projects)).toBe(true);
    expect(
      listData.projects.some((p: { id: string }) => p.id === projectId),
    ).toBe(true);

    // 3. Update project name via PATCH
    const updatedName = `Renamed API Project ${Date.now()}`;
    const updateRes = await page.request.patch(`/api/projects/${projectId}`, {
      data: { name: updatedName },
    });
    expect(updateRes.ok()).toBe(true);
    const updatedData = await updateRes.json();
    expect(updatedData.project.name).toBe(updatedName);

    // 4. Delete project via DELETE
    const deleteRes = await page.request.delete(`/api/projects/${projectId}`);
    expect(deleteRes.ok()).toBe(true);

    // 5. Verify project is no longer in list
    const finalListRes = await page.request.get("/api/projects");
    const finalListData = await finalListRes.json();
    expect(
      finalListData.projects.some((p: { id: string }) => p.id === projectId),
    ).toBe(false);
  });
});
