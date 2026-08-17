import { auth } from "@clerk/nextjs/server";

import { parseJsonBody, readRequiredEmail } from "@/lib/parse-json-body";
import {
  CollaboratorAlreadyInvitedError,
  enrichCollaborators,
  inviteProjectCollaborator,
  listProjectCollaborators,
} from "@/lib/collaborators";
import {
  findAccessibleProjectForViewer,
  getCurrentClerkIdentity,
} from "@/lib/project-access";
import { findProjectById } from "@/lib/projects";
import { getViewerEmails } from "@/lib/viewer-emails";

async function requireAccessibleProject(projectId: string) {
  const { userId } = await auth();
  if (!userId) {
    return {
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const project = await findProjectById(projectId);
  if (!project) {
    return {
      error: Response.json({ error: "Not found" }, { status: 404 }),
    };
  }

  const identity = await getCurrentClerkIdentity();
  if (!identity) {
    return {
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const accessible = await findAccessibleProjectForViewer(projectId, identity);
  if (!accessible) {
    return {
      error: Response.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { project, identity };
}

async function requireOwnedProject(projectId: string) {
  const accessed = await requireAccessibleProject(projectId);
  if ("error" in accessed) {
    return accessed;
  }

  if (accessed.project.ownerId !== accessed.identity.userId) {
    return {
      error: Response.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return accessed;
}

// Auth is enforced in requireAccessibleProject (401 JSON).
// eslint-disable-next-line @clerk/next/require-auth-protection -- helper owns auth
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/projects/[projectId]/collaborators">,
) {
  const { projectId } = await ctx.params;
  const accessed = await requireAccessibleProject(projectId);
  if ("error" in accessed) {
    return accessed.error;
  }

  const collaborators = await enrichCollaborators(
    await listProjectCollaborators(projectId),
  );

  return Response.json({
    collaborators,
    canManage: accessed.project.ownerId === accessed.identity.userId,
  });
}

// Auth is enforced in requireOwnedProject → requireAccessibleProject (401 JSON).
// eslint-disable-next-line @clerk/next/require-auth-protection -- helper owns auth
export async function POST(
  request: Request,
  ctx: RouteContext<"/api/projects/[projectId]/collaborators">,
) {
  const { projectId } = await ctx.params;
  const owned = await requireOwnedProject(projectId);
  if ("error" in owned) {
    return owned.error;
  }

  const parsed = await parseJsonBody(request);
  if (!parsed.ok) {
    return parsed.response;
  }

  const email = readRequiredEmail(parsed.value);
  if (email instanceof Response) {
    return email;
  }

  const viewerEmails = (await getViewerEmails()).map((value) =>
    value.trim().toLowerCase(),
  );
  if (viewerEmails.includes(email)) {
    return Response.json(
      { error: "Cannot invite the project owner" },
      { status: 400 },
    );
  }

  try {
    const collaborator = await inviteProjectCollaborator(projectId, email);
    const [enriched] = await enrichCollaborators([collaborator]);
    return Response.json({ collaborator: enriched }, { status: 201 });
  } catch (error) {
    if (error instanceof CollaboratorAlreadyInvitedError) {
      return Response.json(
        { error: "Collaborator already invited" },
        { status: 409 },
      );
    }

    throw error;
  }
}
