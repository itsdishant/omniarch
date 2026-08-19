import { LiveblocksError } from "@liveblocks/node";

import { getLiveblocksClient } from "@/lib/liveblocks";
import { AI_STATUS_FEED_ID } from "@/types/tasks";

export async function ensureAiStatusFeed(roomId: string) {
  const liveblocks = getLiveblocksClient();

  try {
    await liveblocks.getFeed({ roomId, feedId: AI_STATUS_FEED_ID });
  } catch (error) {
    if (!(error instanceof LiveblocksError) || error.status !== 404) {
      throw error;
    }

    await liveblocks.createFeed({
      roomId,
      feedId: AI_STATUS_FEED_ID,
    });
  }
}

export async function publishAiStatus(roomId: string, text: string) {
  const liveblocks = getLiveblocksClient();
  await ensureAiStatusFeed(roomId);

  await liveblocks.createFeedMessage({
    roomId,
    feedId: AI_STATUS_FEED_ID,
    data: { text },
  });
}
