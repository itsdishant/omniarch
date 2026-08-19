"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useFeedMessages } from "@liveblocks/react";
import {
  useCreateFeed,
  useCreateFeedMessage,
} from "@liveblocks/react/suspense";

import {
  AI_CHAT_FEED_ID,
  parseAiChatMessage,
  type AiChatMessage,
} from "@/types/tasks";

export interface AiChatFeedItem extends AiChatMessage {
  id: string;
}

export function useAiChat() {
  const { user } = useUser();
  const createFeed = useCreateFeed();
  const createFeedMessage = useCreateFeedMessage();
  const { messages, error, isLoading } = useFeedMessages(AI_CHAT_FEED_ID, {
    limit: 50,
  });

  useEffect(() => {
    void createFeed(AI_CHAT_FEED_ID).catch(() => undefined);
  }, [createFeed]);

  const chatMessages: AiChatFeedItem[] = (messages ?? [])
    .flatMap((message) => {
      const parsed = parseAiChatMessage(message.data);
      return parsed ? [{ id: message.id, ...parsed }] : [];
    })
    .sort((left, right) => left.timestamp - right.timestamp);

  async function sendMessage(
    content: string,
    options?: { role?: AiChatMessage["role"]; sender?: string },
  ) {
    const payload = parseAiChatMessage({
      sender:
        options?.sender ??
        user?.fullName ??
        user?.firstName ??
        "You",
      role: options?.role ?? "user",
      content,
      timestamp: Date.now(),
    });

    if (!payload) {
      return false;
    }

    await createFeedMessage(AI_CHAT_FEED_ID, payload);
    return true;
  }

  return {
    messages: chatMessages,
    sendMessage,
    isLoading,
    error,
  };
}
