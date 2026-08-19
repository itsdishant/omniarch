import { auth } from "@clerk/nextjs/server";

import {
  findAccessibleProjectForViewer,
  getCurrentClerkIdentity,
} from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

function getFilename(filePath: string) {
  return filePath.split("/").pop() || "spec.md";
}

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/projects/[projectId]/specs">,
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await ctx.params;
  const identity = await getCurrentClerkIdentity();
  if (!identity) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await findAccessibleProjectForViewer(projectId, identity);
  if (!project) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const specs = await prisma.projectSpec.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true, filePath: true },
  });

  return Response.json({
    specs: specs.map((spec) => ({
      id: spec.id,
      createdAt: spec.createdAt.toISOString(),
      filename: getFilename(spec.filePath),
    })),
  });
}
