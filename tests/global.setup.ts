import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { clerkSetup } from "@clerk/testing/playwright";
import { createClerkClient } from "@clerk/backend";
import { Pool } from "pg";
import { DEFAULT_E2E_EMAIL, DEFAULT_E2E_PASSWORD } from "./helpers/test-auth";

async function globalSetup() {
  await clerkSetup();

  try {
    const client = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    });

    // 1. Ensure dedicated standard E2E runner test account exists (without deleting other accounts)
    const existing = await client.users.getUserList({
      emailAddress: [DEFAULT_E2E_EMAIL],
    });

    let runnerUserId = existing.data[0]?.id;

    if (existing.data.length === 0) {
      const newUser = await client.users.createUser({
        emailAddress: [DEFAULT_E2E_EMAIL],
        password: DEFAULT_E2E_PASSWORD,
        skipPasswordChecks: true,
        skipPasswordRequirement: false,
      });
      runnerUserId = newUser.id;
      console.log(
        `Successfully created dedicated test user: ${DEFAULT_E2E_EMAIL}`,
      );
    } else {
      console.log(`Dedicated test user active: ${DEFAULT_E2E_EMAIL}`);
    }

    // 2. Clean up test projects for the dedicated test user to ensure isolated initial state
    if (runnerUserId && process.env.DATABASE_URL) {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      try {
        await pool.query('DELETE FROM "Project" WHERE "ownerId" = $1', [
          runnerUserId,
        ]);
        console.log("Cleaned up existing test projects for isolated run.");
      } finally {
        await pool.end().catch(() => {});
      }
    }
  } catch (error) {
    console.error("Global setup provisioning notice:", error);
  }
}

export default globalSetup;
