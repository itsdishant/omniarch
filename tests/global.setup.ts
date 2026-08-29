import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { clerkSetup } from "@clerk/testing/playwright";
import { createClerkClient } from "@clerk/backend";
import { DEFAULT_E2E_EMAIL, DEFAULT_E2E_PASSWORD } from "./helpers/test-auth";

async function globalSetup() {
  await clerkSetup();

  try {
    const client = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    });

    // 1. Clean up old ephemeral test users to keep Clerk dev quota clean
    const userList = await client.users.getUserList({ limit: 100 });
    console.log(`Current Clerk users count: ${userList.data.length}`);

    for (const user of userList.data) {
      const email = user.emailAddresses[0]?.emailAddress ?? "";
      if (
        (email.includes("+clerk_test@") || email.startsWith("test.") || email.startsWith("collab.") || email.startsWith("signin.")) &&
        email !== DEFAULT_E2E_EMAIL
      ) {
        await client.users.deleteUser(user.id).catch(() => {});
      }
    }

    // 2. Ensure standard E2E runner test account exists
    const existing = await client.users.getUserList({
      emailAddress: [DEFAULT_E2E_EMAIL],
    });

    if (existing.data.length === 0) {
      await client.users.createUser({
        emailAddress: [DEFAULT_E2E_EMAIL],
        password: DEFAULT_E2E_PASSWORD,
        skipPasswordChecks: true,
        skipPasswordRequirement: false,
      });
      console.log(`Successfully created test user: ${DEFAULT_E2E_EMAIL}`);
    } else {
      console.log(`Test user already exists: ${DEFAULT_E2E_EMAIL}`);
    }
  } catch (error) {
    console.error("Clerk global setup provisioning notice:", error);
  }
}

export default globalSetup;
