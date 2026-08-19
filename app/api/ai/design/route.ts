import { auth } from "@clerk/nextjs/server";
import { auth as triggerAuth, tasks } from "@trigger.dev/sdk";
import type { designAgentTask } from "@/trigger/design-agent";

import {
  parseJsonBody,
  readRequiredProjectId,
  readRequiredPrompt,
  readRequiredRoomId,
} from "@/lib/parse-json-body";
import {
  findAccessibleProjectForViewer,
  getCurrentClerkIdentity,
} from "@/lib/project-access";
import { createTaskRun } from "@/lib/task-runs";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseJsonBody(request);
  if (!parsed.ok) {
    return parsed.response;
  }

  const prompt = readRequiredPrompt(parsed.value);
  if (prompt instanceof Response) return prompt;

  const roomId = readRequiredRoomId(parsed.value);
  if (roomId instanceof Response) return roomId;

  const projectId = readRequiredProjectId(parsed.value);
  if (projectId instanceof Response) return projectId;

  const identity = await getCurrentClerkIdentity();
  if (!identity) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await findAccessibleProjectForViewer(projectId, identity);
  if (!project) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const handle = await tasks.trigger<typeof designAgentTask>("design-agent", {
    prompt,
    roomId,
  });

  await createTaskRun({
    runId: handle.id,
    projectId,
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
