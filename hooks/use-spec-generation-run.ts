"use client";

import { useEffect, useRef, useState } from "react";
import { useRoom } from "@liveblocks/react/suspense";
import { useRealtimeRun } from "@trigger.dev/react-hooks";

import type { generateSpecTask } from "@/trigger/generate-spec";
import type { ChatMessage } from "@/types/spec";

interface SpecRunHandle {
  runId: string;
  publicToken: string;
}

export function useSpecGenerationRun(options: {
  chatHistory: ChatMessage[];
  onComplete: () => Promise<void>;
}) {
  const room = useRoom();
  const [handle, setHandle] = useState<SpecRunHandle | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const finishingRef = useRef(false);

  const { error: realtimeError } = useRealtimeRun<typeof generateSpecTask>(
    handle?.runId,
    {
      accessToken: handle?.publicToken,
      enabled: Boolean(handle?.runId && handle?.publicToken),
      skipColumns: ["payload", "output"],
      onComplete: (completed, completeError) => {
        if (finishingRef.current) return;
        finishingRef.current = true;

        const error =
          completeError?.message ??
          (completed.status === "COMPLETED"
            ? null
            : completed.error?.message || "Spec generation failed");

        if (error) {
          setGenerationError(error);
          setHandle(null);
          return;
        }

        void options
          .onComplete()
          .catch((completionError: unknown) => {
            setGenerationError(
              completionError instanceof Error
                ? completionError.message
                : "Spec generation completed, but the list could not refresh",
            );
          })
          .finally(() => setHandle(null));
      },
    },
  );

  useEffect(() => {
    if (!realtimeError || !handle || finishingRef.current) return;
    finishingRef.current = true;
    setGenerationError(realtimeError.message);
    setHandle(null);
  }, [handle, realtimeError]);

  async function startRun() {
    if (handle) return;

    setGenerationError(null);
    const response = await fetch("/api/ai/spec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: room.id,
        chatHistory: options.chatHistory,
        nodes: [],
        edges: [],
      }),
    });

    const body = (await response.json().catch(() => null)) as {
      runId?: string;
      publicToken?: string;
      error?: string;
    } | null;

    if (!response.ok || !body?.runId || !body.publicToken) {
      const message = body?.error || "Couldn't start spec generation";
      setGenerationError(message);
      throw new Error(message);
    }

    finishingRef.current = false;
    setHandle({ runId: body.runId, publicToken: body.publicToken });
  }

  return {
    error: generationError,
    isRunActive: handle !== null,
    startRun,
  };
}
