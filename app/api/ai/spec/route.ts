import { auth } from "@clerk/nextjs/server";
import { auth as triggerAuth, tasks } from "@trigger.dev/sdk";
import type { generateSpecTask } from "@/trigger/generate-spec";

import { parseJsonBody } from "@/lib/parse-json-body";
import {
  findAccessibleProjectForViewer,
  getCurrentClerkIdentity,
} from "@/lib/project-access";
import { createTaskRun } from "@/lib/task-runs";
import { specGenerationPayloadSchema } from "@/types/spec";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseJsonBody(request);
  if (!parsed.ok) {
    return parsed.response;
  }

  const result = specGenerationPayloadSchema.safeParse(parsed.value);
  if (!result.success) {
    return Response.json({ error: "Invalid request payload" }, { status: 400 });
  }

  const { roomId, chatHistory, nodes, edges } = result.data;

  const identity = await getCurrentClerkIdentity();
  if (!identity) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await findAccessibleProjectForViewer(roomId, identity);
  if (!project) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  if (roomId !== project.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const handle = await tasks.trigger<typeof generateSpecTask>("generate-spec", {
    roomId: project.id,
    chatHistory,
    nodes,
    edges,
  });

  await createTaskRun({
    runId: handle.id,
    projectId: project.id,
    userId,
  });

  const publicToken = await triggerAuth.createPublicToken({
    scopes: {
      read: {
        runs: [handle.id],
      },
    },
  });

  return Response.json({ runId: handle.id, publicToken });
}