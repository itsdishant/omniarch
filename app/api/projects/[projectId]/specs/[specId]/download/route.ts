import { get } from "@vercel/blob";
import { auth } from "@clerk/nextjs/server";

import {
  findAccessibleProjectForViewer,
  getCurrentClerkIdentity,
} from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/projects/[projectId]/specs/[specId]/download">,
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, specId } = await ctx.params;
  const identity = await getCurrentClerkIdentity();
  if (!identity) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await findAccessibleProjectForViewer(projectId, identity);
  if (!project) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const spec = await prisma.projectSpec.findFirst({
    where: { id: specId, projectId: project.id },
  });
  if (!spec) {
    return Response.json({ error: "Spec not found" }, { status: 404 });
  }

  try {
    const blob = await get(spec.filePath, {
      access: "private",
      useCache: false,
    });
    if (!blob) {
      return Response.json({ error: "Spec not found" }, { status: 404 });
    }

    return new Response(blob.stream, {
      headers: {
        "Content-Disposition": 'attachment; filename="spec.md"',
        "Content-Type": "text/markdown; charset=utf-8",
      },
    });
  } catch {
    return Response.json({ error: "Unable to download spec" }, { status: 502 });
  }
}
