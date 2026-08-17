import { auth, currentUser } from "@clerk/nextjs/server";

import { findAccessibleProject } from "@/lib/projects";

export interface ClerkIdentity {
  userId: string;
  primaryEmail: string | null;
}

export async function getCurrentClerkIdentity(): Promise<ClerkIdentity | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();
  const primaryEmail = user?.primaryEmailAddress?.emailAddress ?? null;

  return { userId, primaryEmail };
}

export async function findAccessibleProjectForViewer(
  projectId: string,
  identity: ClerkIdentity,
) {
  const emails = identity.primaryEmail ? [identity.primaryEmail] : [];

  return findAccessibleProject(projectId, identity.userId, emails);
}
