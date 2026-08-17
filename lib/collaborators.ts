import { prisma } from "@/lib/prisma";
import { getClerkProfilesByEmails } from "@/lib/clerk-profiles";
import { isUniqueConstraintError } from "@/lib/projects";

export interface ProjectCollaboratorRecord {
  id: string;
  email: string;
}

export interface EnrichedCollaborator extends ProjectCollaboratorRecord {
  displayName: string | null;
  imageUrl: string | null;
}

export async function listProjectCollaborators(
  projectId: string,
): Promise<ProjectCollaboratorRecord[]> {
  return prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true },
  });
}

export async function enrichCollaborators(
  collaborators: ProjectCollaboratorRecord[],
): Promise<EnrichedCollaborator[]> {
  let profiles = new Map<
    string,
    { displayName: string | null; imageUrl: string | null }
  >();

  try {
    profiles = await getClerkProfilesByEmails(
      collaborators.map((collaborator) => collaborator.email),
    );
  } catch {
    profiles = new Map();
  }

  return collaborators.map((collaborator) => {
    const profile = profiles.get(collaborator.email.toLowerCase());

    return {
      id: collaborator.id,
      email: collaborator.email,
      displayName: profile?.displayName ?? null,
      imageUrl: profile?.imageUrl ?? null,
    };
  });
}

export async function inviteProjectCollaborator(
  projectId: string,
  email: string,
): Promise<ProjectCollaboratorRecord> {
  try {
    return await prisma.projectCollaborator.create({
      data: { projectId, email },
      select: { id: true, email: true },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new CollaboratorAlreadyInvitedError();
    }

    throw error;
  }
}

export async function findProjectCollaborator(
  projectId: string,
  collaboratorId: string,
): Promise<ProjectCollaboratorRecord | null> {
  return prisma.projectCollaborator.findFirst({
    where: { id: collaboratorId, projectId },
    select: { id: true, email: true },
  });
}

export async function removeProjectCollaborator(
  projectId: string,
  collaboratorId: string,
): Promise<ProjectCollaboratorRecord | null> {
  const existing = await findProjectCollaborator(projectId, collaboratorId);

  if (!existing) {
    return null;
  }

  const { count } = await prisma.projectCollaborator.deleteMany({
    where: { id: collaboratorId, projectId },
  });

  if (count === 0) {
    return null;
  }

  return existing;
}

export class CollaboratorAlreadyInvitedError extends Error {
  constructor() {
    super("Collaborator already invited");
    this.name = "CollaboratorAlreadyInvitedError";
  }
}
