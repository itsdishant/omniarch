import { auth } from "@clerk/nextjs/server";

import { parseJsonBody, readOptionalName } from "@/lib/parse-json-body";
import {
  deleteOwnedProject,
  findProjectById,
  renameOwnedProject,
} from "@/lib/projects";

async function requireOwnedProject(userId: string, projectId: string) {
  const project = await findProjectById(projectId);

  if (!project) {
    return {
      error: Response.json({ error: "Not found" }, { status: 404 }),
    };
  }

  if (project.ownerId !== userId) {
    return {
      error: Response.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { project };
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/projects/[projectId]">,
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await ctx.params;
  const owned = await requireOwnedProject(userId, projectId);
  if ("error" in owned) {
    return owned.error;
  }

  const parsed = await parseJsonBody(request);
  if (!parsed.ok) {
    return parsed.response;
  }

  const name = readOptionalName(parsed.value);
  if (name instanceof Response) {
    return name;
  }

  if (name === undefined) {
    return Response.json({ error: "Invalid project name" }, { status: 400 });
  }

  const trimmedName = name.trim();
  if (trimmedName === "") {
    return Response.json({ error: "Invalid project name" }, { status: 400 });
  }

  const project = await renameOwnedProject(projectId, trimmedName);
  return Response.json({ project });
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/projects/[projectId]">,
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await ctx.params;
  const owned = await requireOwnedProject(userId, projectId);
  if ("error" in owned) {
    return owned.error;
  }

  const project = await deleteOwnedProject(projectId);
  return Response.json({ project });
}
