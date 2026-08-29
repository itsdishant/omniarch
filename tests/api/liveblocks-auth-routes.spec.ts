import { expect, test } from "@playwright/test";
import { createAndSignInTestUser } from "../helpers/test-auth";

test.describe("API - Liveblocks Auth Endpoints", () => {
  test("authorizes authenticated room viewer and denies invalid room", async ({
    page,
  }) => {
    await createAndSignInTestUser(page, { prefix: "api.liveblocks" });

    // Create a project to get a valid room
    const createRes = await page.request.post("/api/projects", {
      data: { name: `Liveblocks API Project ${Date.now()}` },
    });
    const createdData = await createRes.json();
    const roomId = createdData.project.id;

    // 1. Authorize valid room
    const authRes = await page.request.post("/api/liveblocks-auth", {
      data: { room: roomId },
    });
    expect(authRes.ok()).toBe(true);
    const authData = await authRes.json();
    expect(authData).toHaveProperty("token");

    // 2. Deny non-existent / unauthorized room with 403
    const badAuthRes = await page.request.post("/api/liveblocks-auth", {
      data: { room: "non-existent-room-9999" },
    });
    expect(badAuthRes.status()).toBe(403);
  });
});
