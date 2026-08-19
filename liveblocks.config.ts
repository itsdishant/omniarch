// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
import type { LiveObject, LiveMap } from "@liveblocks/core";
import type { LiveblocksNode, LiveblocksEdge } from "@liveblocks/react-flow";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
      thinking: boolean;
    };

    Storage: {
      flow: LiveObject<{
        nodes: LiveMap<string, LiveblocksNode<CanvasNode>>;
        edges: LiveMap<string, LiveblocksEdge<CanvasEdge>>;
      }>;
    };

    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };

    RoomEvent: never;
    ThreadMetadata: Record<string, never>;
    RoomInfo: {
      title: string;
    };
    GroupInfo: Record<string, never>;
    ActivitiesData: Record<string, never>;
    FeedMessageData: {
      text?: string;
      sender?: string;
      role?: "user" | "assistant";
      content?: string;
      timestamp?: number;
    };
    FeedMetadata: Record<string, never>;
  }
}

export {};
