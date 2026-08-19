"use client";

import { useEffect } from "react";
import { useFeedMessages } from "@liveblocks/react";
import { useCreateFeed, useOthersMapped } from "@liveblocks/react/suspense";

import {
  AI_STATUS_FEED_ID,
  getLatestAiStatusText,
} from "@/types/tasks";

export function useAiStatus() {
  const createFeed = useCreateFeed();
  const othersThinking = useOthersMapped(
    (other) => other.presence.thinking === true,
  );
  const { messages, error, isLoading } = useFeedMessages(AI_STATUS_FEED_ID, {
    limit: 20,
  });

  useEffect(() => {
    void createFeed(AI_STATUS_FEED_ID).catch(() => undefined);
  }, [createFeed]);

  const isGenerating = othersThinking.some(([, thinking]) => thinking);
  const statusText =
    error || isLoading || !messages
      ? undefined
      : getLatestAiStatusText(messages);

  return { isGenerating, statusText };
}
