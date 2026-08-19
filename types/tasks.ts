import { z } from "zod";

export const AI_STATUS_FEED_ID = "ai-status-feed";
export const AI_CHAT_FEED_ID = "ai-chat";

export interface AiStatusPayload {
  text?: string;
}

export function isAiStatusPayload(value: unknown): value is AiStatusPayload {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const text = (value as { text?: unknown }).text;
  return text === undefined || typeof text === "string";
}

export function getLatestAiStatusText(
  messages: ReadonlyArray<{ createdAt: number; data: unknown }>,
): string | undefined {
  let latestCreatedAt = Number.NEGATIVE_INFINITY;
  let text: string | undefined;

  for (const message of messages) {
    if (!isAiStatusPayload(message.data)) {
      continue;
    }

    if (message.createdAt < latestCreatedAt) {
      continue;
    }

    latestCreatedAt = message.createdAt;
    text = message.data.text;
  }

  return text;
}

export const aiChatMessageSchema = z.object({
  sender: z.string().min(1),
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
  timestamp: z.number(),
});

export type AiChatMessage = z.infer<typeof aiChatMessageSchema>;

export function parseAiChatMessage(value: unknown): AiChatMessage | null {
  const result = aiChatMessageSchema.safeParse(value);
  return result.success ? result.data : null;
}
