import { ProjectStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const DEFAULT_PROJECT_NAME = "Untitled Project";

function resolveProjectName(name: string | undefined): string {
  const trimmed = name?.trim();
  return trimmed ? trimmed : DEFAULT_PROJECT_NAME;
}

function canvasPathFor(projectId: string): string {
  return `canvas/${projectId}.json`;
}

export interface EditorProjectListItem {
  id: string;
  name: string;
}

export function toEditorProjectListItem(project: {
  id: string;
  name: string;
}): EditorProjectListItem {
  return {
    id: project.id,
    name: project.name,
  };
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
    ownedProjects: ownedProjects.map(toEditorProjectListItem),
    sharedProjects: sharedProjects.map(toEditorProjectListItem),
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
      canvasJsonPath: input.id ? canvasPathFor(input.id) : "",
    },
  });

  if (project.canvasJsonPath !== "") {
    return project;
  }

  return prisma.project.update({
    where: { id: project.id },
    data: { canvasJsonPath: canvasPathFor(project.id) },
  });
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
  return prisma.project.delete({
    where: { id: projectId },
  });
}
