import { get, put } from "@vercel/blob";
import { auth } from "@clerk/nextjs/server";

import { parseJsonBody, ensureObject } from "@/lib/parse-json-body";
import {
  findAccessibleProjectForViewer,
  getCurrentClerkIdentity,
} from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

async function getAccessibleProject(projectId: string) {
  const identity = await getCurrentClerkIdentity();
  if (!identity)
    return {
      response: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };

  const project = await findAccessibleProjectForViewer(projectId, identity);
  if (!project)
    return { response: Response.json({ error: "Forbidden" }, { status: 403 }) };
  return { project };
}

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/projects/[projectId]/canvas">,
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await ctx.params;
  const accessible = await getAccessibleProject(projectId);
  if ("response" in accessible) return accessible.response;

  if (
    !accessible.project.canvasJsonPath ||
    !accessible.project.canvasJsonPath.startsWith("http")
  ) {
    return Response.json({ canvas: null });
  }

  try {
    const blob = await get(accessible.project.canvasJsonPath, {
      access: "private",
      useCache: false,
    });
    if (!blob) return Response.json({ canvas: null });
    return Response.json({ canvas: await new Response(blob.stream).json() });
  } catch {
    return Response.json(
      { error: "Unable to load saved canvas" },
      { status: 502 },
    );
  }
}

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/projects/[projectId]/canvas">,
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await ctx.params;
  const accessible = await getAccessibleProject(projectId);
  if ("response" in accessible) return accessible.response;

  const parsed = await parseJsonBody(request);
  if (!parsed.ok) return parsed.response;
  const body = ensureObject(parsed.value);
  if (body instanceof Response) return body;

  if (!Array.isArray(body.nodes) || !Array.isArray(body.edges)) {
    return Response.json(
      { error: "Canvas nodes and edges are required" },
      { status: 400 },
    );
  }

  const blob = await put(
    `canvas/${projectId}.json`,
    JSON.stringify({ nodes: body.nodes, edges: body.edges }),
    {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    },
  );

  await prisma.project.update({
    where: { id: projectId },
    data: { canvasJsonPath: blob.url },
  });

  return Response.json({ url: blob.url });
}
