import { clerkClient } from "@clerk/nextjs/server";

export interface ClerkUserProfile {
  displayName: string | null;
  imageUrl: string | null;
}

const CLERK_EMAIL_BATCH_SIZE = 100;

function displayNameFor(user: {
  firstName: string | null;
  lastName: string | null;
  username: string | null;
}): string | null {
  const fullName = [user.firstName, user.lastName]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" ")
    .trim();

  if (fullName !== "") {
    return fullName;
  }

  if (user.username && user.username.trim() !== "") {
    return user.username;
  }

  return null;
}

export async function getClerkProfilesByEmails(
  emails: string[],
): Promise<Map<string, ClerkUserProfile>> {
  const profiles = new Map<string, ClerkUserProfile>();
  const uniqueEmails = [
    ...new Set(
      emails.map((email) => email.trim().toLowerCase()).filter(Boolean),
    ),
  ];

  if (uniqueEmails.length === 0) {
    return profiles;
  }

  const client = await clerkClient();

  for (
    let index = 0;
    index < uniqueEmails.length;
    index += CLERK_EMAIL_BATCH_SIZE
  ) {
    const batch = uniqueEmails.slice(index, index + CLERK_EMAIL_BATCH_SIZE);
    const users = await client.users.getUserList({
      emailAddress: batch,
      limit: CLERK_EMAIL_BATCH_SIZE,
    });

    for (const user of users.data) {
      const profile: ClerkUserProfile = {
        displayName: displayNameFor(user),
        imageUrl: user.imageUrl || null,
      };

      for (const address of user.emailAddresses) {
        profiles.set(address.emailAddress.trim().toLowerCase(), profile);
      }
    }
  }

  return profiles;
}

export async function getClerkProfileByUserId(
  userId: string,
): Promise<(ClerkUserProfile & { email: string | null }) | null> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email =
    user.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ??
    user.emailAddresses[0]?.emailAddress?.trim().toLowerCase() ??
    null;

  return {
    displayName: displayNameFor(user),
    imageUrl: user.imageUrl || null,
    email,
  };
}
