import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { createClerkClient } from "@clerk/backend";
import { Pool } from "pg";
import { DEFAULT_E2E_EMAIL } from "./helpers/test-auth";

async function globalTeardown() {
  try {
    const client = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    });

    const userList = await client.users.getUserList({
      emailAddress: [DEFAULT_E2E_EMAIL],
    });

    const runnerUserId = userList.data[0]?.id;

    if (runnerUserId && process.env.DATABASE_URL) {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      try {
        await pool.query('DELETE FROM "Project" WHERE "ownerId" = $1', [
          runnerUserId,
        ]);
        console.log("Teardown: successfully cleaned up test projects.");
      } finally {
        await pool.end().catch(() => {});
      }
    }
  } catch (error) {
    console.warn("Global teardown notice:", error);
  }
}

export default globalTeardown;
