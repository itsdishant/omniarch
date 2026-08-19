"use client";

import type { ReactNode } from "react";
import { LiveMap, LiveObject } from "@liveblocks/core";
import {
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";
import type { LiveblocksEdge, LiveblocksNode } from "@liveblocks/react-flow";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

interface LiveblocksRoomProps {
  children: ReactNode;
  roomId: string;
}

export function LiveblocksRoom({ children, roomId }: LiveblocksRoomProps) {
  const initialStorage = {
    flow: new LiveObject({
      nodes: new LiveMap<string, LiveblocksNode<CanvasNode>>(),
      edges: new LiveMap<string, LiveblocksEdge<CanvasEdge>>(),
    }),
  };

  return (
    <LiveblocksProvider
      authEndpoint="/api/liveblocks-auth"
      throttle={16}
      preventUnsavedChanges
      badgeLocation="top-right"
    >
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, thinking: false }}
        initialStorage={initialStorage}
      >
        {children}
      </RoomProvider>
    </LiveblocksProvider>
  );
}
