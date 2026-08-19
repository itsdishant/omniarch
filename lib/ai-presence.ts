import { getCursorColor, getLiveblocksClient } from "@/lib/liveblocks";

export const AI_AGENT_USER_ID = "omniarch-ai";

const AI_USER_INFO = {
  name: "OmniArch",
  avatar: "",
  color: getCursorColor(AI_AGENT_USER_ID),
};

export async function updateAiPresence(
  roomId: string,
  presence: {
    cursor: { x: number; y: number } | null;
    thinking: boolean;
  },
  ttl = 60,
) {
  const liveblocks = getLiveblocksClient();
  await liveblocks.setPresence(roomId, {
    userId: AI_AGENT_USER_ID,
    data: presence,
    userInfo: AI_USER_INFO,
    ttl,
  });
}

export async function clearAiPresence(roomId: string) {
  await updateAiPresence(
    roomId,
    { cursor: null, thinking: false },
    2,
  );
}
