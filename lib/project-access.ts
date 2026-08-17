import { auth, currentUser } from "@clerk/nextjs/server";

import { findAccessibleProject } from "@/lib/projects";

export interface ClerkIdentity {
  userId: string;
  primaryEmail: string | null;
  verifiedEmails: string[];
}

export async function getCurrentClerkIdentity(): Promise<ClerkIdentity | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();
  const primaryEmail = user?.primaryEmailAddress?.emailAddress ?? null;

  // Include all verified email addresses, not just the primary one.
  // This ensures collaborators invited via non-primary verified emails
  // are correctly recognized in membership queries.
  const verifiedEmails =
    user?.emailAddresses
      ?.filter((e) => e.verification?.status === "verified")
      .map((e) => e.emailAddress) ?? [];

  return { userId, primaryEmail, verifiedEmails };
}

export async function findAccessibleProjectForViewer(
  projectId: string,
  identity: ClerkIdentity,
) {
  // Only use verified emails. Never fall back to an unverified primary email,
  // as that would grant access without proving ownership of the invited address.
  const emails = identity.verifiedEmails;

  return findAccessibleProject(projectId, identity.userId, emails);
}
