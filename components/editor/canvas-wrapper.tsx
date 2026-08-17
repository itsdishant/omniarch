"use client";

import { useCallback, useRef, useState } from "react";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useErrorListener,
  useLostConnectionListener,
  useOther,
} from "@liveblocks/react/suspense";
import {
  Cursors,
  useLiveblocksFlow,
  type CursorsCursorProps,
} from "@liveblocks/react-flow";
import { Cursor } from "@liveblocks/react-ui";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type NodeTypes,
} from "@xyflow/react";
import { ErrorBoundary } from "react-error-boundary";
import "@xyflow/react/dist/style.css";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-flow/styles.css";

import { LiveObject, LiveMap } from "@liveblocks/core";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";
import { DEFAULT_NODE_COLOR } from "@/types/canvas";
import {
  ShapePanel,
  readShapeDragPayload,
} from "@/components/editor/shape-panel";

interface CanvasWrapperProps {
  roomId: string;
}

function CanvasErrorFallback() {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-destructive/50 bg-destructive/10">
        <svg
          className="h-6 w-6 text-destructive"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <p className="text-[11px] font-medium tracking-[0.18em] text-copy-muted">
        CONNECTION ERROR
      </p>
      <h2 className="mt-2 max-w-md text-xl font-medium text-copy-primary">
        Unable to connect to the collaboration server.
      </h2>
      <p className="mt-2 max-w-md text-sm text-copy-muted">
        Please check your connection and refresh the page.
      </p>
    </div>
  );
}

function CanvasLoadingFallback() {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-surface-border bg-elevated">
        <svg
          className="h-6 w-6 text-brand animate-spin"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      <p className="text-[11px] font-medium tracking-[0.18em] text-copy-muted">
        LOADING CANVAS
      </p>
      <h2 className="mt-2 max-w-md text-xl font-medium text-copy-primary">
        Initializing collaborative workspace…
      </h2>
    </div>
  );
}

function RoomConnectionStatus() {
  const [message, setMessage] = useState<string | null>(null);

  useErrorListener((error) => {
    if (error.context.type === "ROOM_CONNECTION_ERROR") {
      setMessage("Unable to connect to the collaboration server.");
    }
  });

  useLostConnectionListener((event) => {
    switch (event) {
      case "lost":
        setMessage("Still trying to reconnect…");
        break;
      case "restored":
        setMessage(null);
        break;
      case "failed":
        setMessage("Could not restore the collaboration connection.");
        break;
    }
  });

  if (!message) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute left-1/2 top-3 z-40 -translate-x-1/2 rounded-full border border-surface-border bg-elevated/95 px-3 py-1.5 text-xs text-copy-secondary shadow-lg backdrop-blur-sm">
      {message}
    </div>
  );
}

function FlowCursor({ connectionId }: CursorsCursorProps) {
  const info = useOther(connectionId, (other) => other.info);

  return <Cursor color={info.color} label={info.name} />;
}

function CanvasNodeComponent({ data }: { data: CanvasNode["data"] }) {
  const { label, color, shape } = data;
  return (
    <div
      className="flex min-h-12 min-w-20 items-center justify-center rounded-md border-2"
      style={{
        borderColor: color,
        backgroundColor: `${color}15`,
        color: color,
      }}
    >
      <span className="max-w-full truncate px-3 py-1.5 text-sm font-medium">
        {label || shape}
      </span>
    </div>
  );
}

const canvasNodeTypes: NodeTypes = {
  canvasNode: CanvasNodeComponent,
};

function CanvasFlow() {
  const nodeCounterRef = useRef(0);
  const { screenToFlowPosition } = useReactFlow<CanvasNode, CanvasEdge>();
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const payload = readShapeDragPayload(e.dataTransfer);
      if (!payload) {
        return;
      }

      const { shape, width, height } = payload;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });

      nodeCounterRef.current += 1;
      const nodeId = `${shape}-${Date.now()}-${nodeCounterRef.current}`;

      const newNode: CanvasNode = {
        id: nodeId,
        type: "canvasNode",
        position,
        data: {
          label: "",
          color: DEFAULT_NODE_COLOR,
          shape,
        },
        style: {
          width,
          height,
        },
      };

      onNodesChange([{ type: "add", item: newNode }]);
    },
    [onNodesChange, screenToFlowPosition],
  );

  return (
    <div
      className="relative h-full min-h-0 w-full flex-1 bg-base"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ReactFlow
        className="h-full min-h-0 w-full bg-base"
        colorMode="dark"
        fitView
        connectionMode={ConnectionMode.Loose}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        nodeTypes={canvasNodeTypes}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="color-mix(in srgb, var(--text-primary) 16%, transparent)"
          gap={20}
          size={1}
        />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const canvasNode = node as CanvasNode;
            return canvasNode.data?.color || DEFAULT_NODE_COLOR;
          }}
          nodeBorderRadius={4}
          nodeStrokeWidth={1.5}
          maskColor="color-mix(in srgb, var(--bg-base) 80%, transparent)"
        />
        <Cursors components={{ Cursor: FlowCursor }} />
      </ReactFlow>
      <ShapePanel />
    </div>
  );
}

function CanvasContent() {
  return (
    <ReactFlowProvider>
      <RoomConnectionStatus />
      <CanvasFlow />
    </ReactFlowProvider>
  );
}

export function CanvasWrapper({ roomId }: CanvasWrapperProps) {
  const initialStorage = {
    flow: new LiveObject({
      nodes: new LiveMap<string, never>(),
      edges: new LiveMap<string, never>(),
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
        initialPresence={{ cursor: null, isThinking: false }}
        initialStorage={initialStorage}
      >
        <ErrorBoundary fallback={<CanvasErrorFallback />}>
          <ClientSideSuspense fallback={<CanvasLoadingFallback />}>
            <CanvasContent />
          </ClientSideSuspense>
        </ErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
