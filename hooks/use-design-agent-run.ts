"use client";

import { useEffect, useRef, useState } from "react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { useRoom } from "@liveblocks/react/suspense";
import type { designAgentTask } from "@/trigger/design-agent";

interface DesignRunHandle {
  runId: string;
  publicToken: string;
}

export function useDesignAgentRun(options: {
  sendAssistantMessage: (content: string) => Promise<boolean>;
}) {
  const room = useRoom();
  const [handle, setHandle] = useState<DesignRunHandle | null>(null);
  const finishingRef = useRef(false);
  const sendRef = useRef(options.sendAssistantMessage);
  sendRef.current = options.sendAssistantMessage;

  const { run, error } = useRealtimeRun<typeof designAgentTask>(
    handle?.runId,
    {
      accessToken: handle?.publicToken,
      enabled: Boolean(handle?.runId && handle?.publicToken),
      skipColumns: ["payload"],
      onComplete: (completed, completeError) => {
        if (finishingRef.current) {
          return;
        }
        finishingRef.current = true;

        const summary =
          typeof completed.output?.summary === "string"
            ? completed.output.summary.trim()
            : "";
        const content = completeError
          ? completeError.message
          : completed.status === "COMPLETED"
            ? summary || "Design complete"
            : completed.error?.message || "Design generation failed";

        void sendRef.current(content).finally(() => {
          setHandle(null);
        });
      },
    },
  );

  useEffect(() => {
    if (!error || !handle || finishingRef.current) {
      return;
    }
    finishingRef.current = true;
    void sendRef.current(error.message).finally(() => {
      setHandle(null);
    });
  }, [error, handle]);

  async function startRun(prompt: string) {
    const response = await fetch("/api/ai/design", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        roomId: room.id,
        projectId: room.id,
      }),
    });

    const body = (await response.json().catch(() => null)) as
      | { runId?: string; publicToken?: string; error?: string }
      | null;

    if (!response.ok || !body?.runId || !body.publicToken) {
      throw new Error(body?.error || "Couldn't start design generation");
    }

    finishingRef.current = false;
    setHandle({ runId: body.runId, publicToken: body.publicToken });
    return body.runId;
  }

  return {
    isRunActive: handle !== null,
    run,
    startRun,
  };
}
