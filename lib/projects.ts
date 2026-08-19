import { Prisma } from "@/generated/prisma/client";
import { ProjectStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { del } from "@vercel/blob";

export function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

const DEFAULT_PROJECT_NAME = "Untitled Project";

function resolveProjectName(name: string | undefined): string {
  const trimmed = name?.trim();
  return trimmed ? trimmed : DEFAULT_PROJECT_NAME;
}

export interface EditorProjectListItem {
  id: string;
  name: string;
}

export async function listOwnedProjects(ownerId: string) {
  return prisma.project.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
  });
}

export async function listSharedProjects(emails: string[], viewerId: string) {
  if (emails.length === 0) {
    return [];
  }

  return prisma.project.findMany({
    where: {
      ownerId: { not: viewerId },
      collaborators: {
        some: {
          email: { in: emails },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function listEditorSidebarProjects(
  userId: string,
  emails: string[],
) {
  const [ownedProjects, sharedProjects] = await Promise.all([
    listOwnedProjects(userId),
    listSharedProjects(emails, userId),
  ]);

  return {
    ownedProjects: ownedProjects.map((p) => ({ id: p.id, name: p.name })),
    sharedProjects: sharedProjects.map((p) => ({ id: p.id, name: p.name })),
  };
}

interface CreateOwnedProjectInput {
  name?: string;
  id?: string;
}

export async function createOwnedProject(
  ownerId: string,
  input: CreateOwnedProjectInput = {},
) {
  const project = await prisma.project.create({
    data: {
      ...(input.id ? { id: input.id } : {}),
      ownerId,
      name: resolveProjectName(input.name),
      status: ProjectStatus.DRAFT,
      canvasJsonPath: "",
    },
  });
  return project;
}

export async function findProjectById(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
  });
}

export async function findAccessibleProject(
  projectId: string,
  userId: string,
  emails: string[],
) {
  const project = await findProjectById(projectId);

  if (!project) {
    return null;
  }

  if (project.ownerId === userId) {
    return project;
  }

  if (emails.length === 0) {
    return null;
  }

  const collaborator = await prisma.projectCollaborator.findFirst({
    where: {
      projectId,
      email: { in: emails },
    },
  });

  return collaborator ? project : null;
}

export async function renameOwnedProject(projectId: string, name: string) {
  return prisma.project.update({
    where: { id: projectId },
    data: { name },
  });
}

export async function deleteOwnedProject(projectId: string) {
  // Fetch blob URLs before deleting the project (cascade will remove ProjectSpec records)
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { canvasJsonPath: true, specs: { select: { filePath: true } } },
  });

  const blobUrls = [
    ...(project?.canvasJsonPath ? [project.canvasJsonPath] : []),
    ...(project?.specs?.map((s) => s.filePath) ?? []),
  ];

  // Delete the project (cascades to ProjectSpec, ProjectCollaborator, TaskRun)
  const deletedProject = await prisma.project.delete({
    where: { id: projectId },
  });

  // Clean up associated blobs after successful project deletion
  for (const url of blobUrls) {
    if (url) {
      try {
        await del(url);
      } catch (error) {
        // Log but don't fail the deletion if blob cleanup fails
        console.error(`Failed to delete blob ${url}:`, error);
      }
    }
  }

  return deletedProject;
}
