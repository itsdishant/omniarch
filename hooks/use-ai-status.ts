"use client";

import { useEffect } from "react";
import { useFeedMessages } from "@liveblocks/react";
import { useCreateFeed, useOthersMapped } from "@liveblocks/react/suspense";

import {
  AI_STATUS_FEED_ID,
  getLatestAiStatusText,
} from "@/types/tasks";

export function useAiGenerating() {
  const othersThinking = useOthersMapped(
    (other) => other.presence.thinking === true,
  );

  return othersThinking.some(([, thinking]) => thinking);
}

export function useAiStatusText() {
  const createFeed = useCreateFeed();
  const { messages, error, isLoading } = useFeedMessages(AI_STATUS_FEED_ID, {
    limit: 20,
  });

  useEffect(() => {
    void createFeed(AI_STATUS_FEED_ID).catch(() => undefined);
  }, [createFeed]);

  if (error || isLoading || !messages) {
    return undefined;
  }

  return getLatestAiStatusText(messages);
}
