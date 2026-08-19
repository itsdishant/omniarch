import { auth } from "@clerk/nextjs/server";

import { removeProjectCollaborator } from "@/lib/collaborators";
import { findProjectById } from "@/lib/projects";

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/projects/[projectId]/collaborators/[collaboratorId]">,
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, collaboratorId } = await ctx.params;
  const project = await findProjectById(projectId);

  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (project.ownerId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const collaborator = await removeProjectCollaborator(
    projectId,
    collaboratorId,
  );

  if (!collaborator) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ collaborator });
}
