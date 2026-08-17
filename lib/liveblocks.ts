import { Liveblocks } from "@liveblocks/node";

// Fixed palette of cursor colors for consistent user identification
const CURSOR_COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#FFE66D", // Yellow
  "#95E1D3", // Mint
  "#F38181", // Coral
  "#AA96DA", // Purple
  "#FCBAD3", // Pink
  "#A8D8EA", // Light Blue
  "#FFD3B6", // Peach
  "#C7EFCF", // Light Green
] as const;

/**
 * Deterministically maps a user ID to a consistent color from the fixed palette.
 * Uses a simple hash function to ensure the same user always gets the same color.
 */
export function getCursorColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % CURSOR_COLORS.length;
  return CURSOR_COLORS[index];
}

// Cached Liveblocks client instance
let liveblocksClient: Liveblocks | null = null;

export function getLiveblocksClient(): Liveblocks {
  if (!liveblocksClient) {
    const secret = process.env.LIVEBLOCKS_SECRET_KEY;
    if (!secret) {
      throw new Error("LIVEBLOCKS_SECRET_KEY is not set");
    }
    liveblocksClient = new Liveblocks({ secret });
  }
  return liveblocksClient;
}

export async function ensureLiveblocksRoom(
  roomId: string,
  metadata: Record<string, string> = {},
) {
  const liveblocks = getLiveblocksClient();
  return liveblocks.getOrCreateRoom(roomId, {
    defaultAccesses: [],
    metadata,
  });
}