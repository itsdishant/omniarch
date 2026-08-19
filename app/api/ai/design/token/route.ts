import { auth } from "@clerk/nextjs/server";
import { auth as triggerAuth } from "@trigger.dev/sdk";

import { parseJsonBody, readRequiredRunId } from "@/lib/parse-json-body";
import { findOwnedTaskRun } from "@/lib/task-runs";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseJsonBody(request);
  if (!parsed.ok) {
    return parsed.response;
  }

  const runId = readRequiredRunId(parsed.value);
  if (runId instanceof Response) return runId;

  const taskRun = await findOwnedTaskRun(runId, userId);
  if (!taskRun) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = await triggerAuth.createPublicToken({
    scopes: {
      read: {
        runs: [runId],
      },
    },
  });

  return Response.json({ token });
}
