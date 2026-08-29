import { expect, test } from "@playwright/test";
import { createAndSignInTestUser } from "../helpers/test-auth";

test.describe("API - Collaborator Endpoints", () => {
  test("manages project collaborators via REST API", async ({ page }) => {
    const { email } = await createAndSignInTestUser(page, {
      prefix: "api.collabs",
    });

    // Create a project first
    const createRes = await page.request.post("/api/projects", {
      data: { name: `Collab API Project ${Date.now()}` },
    });
    const createdData = await createRes.json();
    const projectId = createdData.project.id;

    // 1. Fetch initial collaborators
    const getRes = await page.request.get(
      `/api/projects/${projectId}/collaborators`,
    );
    expect(getRes.ok()).toBe(true);
    const getData = await getRes.json();
    expect(getData.canManage).toBe(true);
    expect(getData.owner.email).toBe(email);
    expect(Array.isArray(getData.collaborators)).toBe(true);

    // 2. Add collaborator
    const collabEmail = `collab.api.${Date.now()}@example.com`;
    const addRes = await page.request.post(
      `/api/projects/${projectId}/collaborators`,
      { data: { email: collabEmail } },
    );
    expect(addRes.ok()).toBe(true);
    const addData = await addRes.json();
    expect(addData.collaborator.email).toBe(collabEmail);
    const collaboratorId = addData.collaborator.id;

    // 3. Delete collaborator
    const delRes = await page.request.delete(
      `/api/projects/${projectId}/collaborators/${collaboratorId}`,
    );
    expect(delRes.ok()).toBe(true);

    // 4. Verify removed
    const verifyRes = await page.request.get(
      `/api/projects/${projectId}/collaborators`,
    );
    const verifyData = await verifyRes.json();
    expect(
      verifyData.collaborators.some(
        (c: { id: string }) => c.id === collaboratorId,
      ),
    ).toBe(false);
  });
});
