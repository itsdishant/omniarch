import { expect, test } from "@playwright/test";
import { createAndSignInTestUser } from "../helpers/test-auth";

test.describe("API - AI Endpoints", () => {
  test("validates request payload and checks task run authorization", async ({
    page,
  }) => {
    await createAndSignInTestUser(page, { prefix: "api.ai" });

    // 1. Invalid payload to /api/ai/design/token should fail with 400
    const badTokenRes = await page.request.post("/api/ai/design/token", {
      data: {},
    });
    expect(badTokenRes.status()).toBe(400);

    // 2. Non-existent runId to /api/ai/design/token should fail with 403
    const forbiddenTokenRes = await page.request.post("/api/ai/design/token", {
      data: { runId: "non-existent-run-id-9999" },
    });
    expect(forbiddenTokenRes.status()).toBe(403);
  });
});
