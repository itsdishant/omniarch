"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  ClientSideSuspense,
  useCanRedo,
  useCanUndo,
  useErrorListener,
  useLostConnectionListener,
  useOther,
  useOthers,
  useRedo,
  useUndo,
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
  ConnectionLineType,
  ConnectionMode,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useEdges,
  useNodes,
  useReactFlow,
  type DefaultEdgeOptions,
  type EdgeTypes,
} from "@xyflow/react";
import { ErrorBoundary } from "react-error-boundary";
import { Loader2 } from "lucide-react";
import "@xyflow/react/dist/style.css";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-flow/styles.css";

import {
  CanvasControls,
  CANVAS_ZOOM_DURATION,
} from "@/components/editor/canvas-controls";
import {
  CanvasEdgeComponent,
  EdgeActionsContext,
} from "@/components/editor/canvas-edge";
import {
  canvasNodeTypes,
  NodeActionsContext,
  resolveNodeSize,
} from "@/components/editor/canvas-node";
import { renderShapeContent } from "@/components/editor/canvas-shapes";
import {
  ShapePanel,
  readShapeDragPayload,
} from "@/components/editor/shape-panel";
import { useStarterTemplateImport } from "@/components/editor/starter-template-context";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useCanvasAutosave } from "@/hook/useCanvasAutosave";
import type {
  CanvasEdge,
  CanvasNode,
  CanvasShape,
  NodeColorPair,
} from "@/types/canvas";
import {
  DEFAULT_EDGE_COLOR,
  DEFAULT_EDGE_STROKE_WIDTH,
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_TEXT_COLOR,
  DEFAULT_SHAPE_SIZES,
} from "@/types/canvas";

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
  const thinking = useOther(
    connectionId,
    (other) => other.presence.thinking === true,
  );

  return (
    <Cursor
      color={info.color}
      label={
        <span className="inline-flex items-center gap-1">
          {thinking ? (
            <Loader2 className="size-3 animate-spin" aria-hidden="true" />
          ) : null}
          {info.name}
        </span>
      }
    />
  );
}

function ParticipantAvatars() {
  const { userId } = useAuth();
  const { user } = useUser();
  const others = useOthers();
  const collaborators = others.filter((other) => other.id !== userId);
  const visibleCollaborators = collaborators.slice(0, 5);
  const overflowCount = collaborators.length - visibleCollaborators.length;
  const currentUserName = user?.fullName || user?.firstName || "You";
  const currentUserInitials = currentUserName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="pointer-events-auto absolute right-4 top-4 z-30 flex items-center rounded-full border border-surface-border bg-elevated/90 p-1.5 shadow-lg backdrop-blur-sm">
      <div className="flex items-center">
        {visibleCollaborators.map((other, index) => {
          const name = other.info.name || "Collaborator";
          const initials = name
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <div
              key={other.connectionId}
              aria-label={name}
              className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-base text-[10px] font-semibold text-copy-primary ring-1 ring-white/15"
              style={{
                backgroundColor: other.info.color,
                marginLeft: index === 0 ? 0 : -8,
                zIndex: visibleCollaborators.length - index,
              }}
            >
              {other.info.avatar ? (
                // Liveblocks user metadata is supplied by the authenticated session.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={other.info.avatar}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
          );
        })}
        {overflowCount > 0 ? (
          <div className="relative z-0 ml-1 flex h-8 min-w-8 items-center justify-center rounded-full border-2 border-base bg-surface px-1.5 text-[10px] font-semibold text-copy-secondary ring-1 ring-white/15">
            +{overflowCount}
          </div>
        ) : null}
      </div>
      {collaborators.length > 0 ? (
        <div className="mx-2 h-6 w-px bg-surface-border" aria-hidden="true" />
      ) : null}
      <div
        aria-label={currentUserName}
        title={currentUserName}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-base bg-subtle text-[10px] font-semibold text-copy-primary ring-1 ring-white/15"
      >
        {user?.imageUrl ? (
          // Clerk's current user image is display-only in the canvas presence group.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          currentUserInitials
        )}
      </div>
    </div>
  );
}

const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "canvasEdge",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: DEFAULT_EDGE_COLOR,
    width: 16,
    height: 16,
  },
  style: {
    stroke: DEFAULT_EDGE_COLOR,
    strokeWidth: DEFAULT_EDGE_STROKE_WIDTH,
    strokeLinecap: "round",
  },
  data: { label: "" },
};

const canvasEdgeTypes: EdgeTypes = {
  canvasEdge: CanvasEdgeComponent,
};

function CanvasFlow({ projectId }: { projectId: string }) {
  const reactFlow = useReactFlow<CanvasNode, CanvasEdge>();
  const { screenToFlowPosition, zoomIn, zoomOut, fitView } = reactFlow;
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });
  const { registerImporter } = useStarterTemplateImport();
  const selectedNodes = useNodes<CanvasNode>().filter((node) => node.selected);
  const selectedEdges = useEdges<CanvasEdge>().filter((edge) => edge.selected);
  const loadCanvas = useCallback(
    (savedNodes: CanvasNode[], savedEdges: CanvasEdge[]) => {
      onNodesChange(savedNodes.map((item) => ({ type: "add" as const, item })));
      onEdgesChange(savedEdges.map((item) => ({ type: "add" as const, item })));
    },
    [onEdgesChange, onNodesChange],
  );
  useCanvasAutosave({ projectId, nodes, edges, onLoad: loadCanvas });
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);

  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [edges, nodes]);

  useKeyboardShortcuts({
    reactFlow,
    undo,
    redo,
  });

  useEffect(() => {
    function handleDeleteKey(event: KeyboardEvent) {
      if (
        event.target instanceof Element &&
        event.target.closest("input, textarea, [contenteditable='true']")
      ) {
        return;
      }
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      if (selectedNodes.length === 0 && selectedEdges.length === 0) return;

      event.preventDefault();
      onDelete({ nodes: selectedNodes, edges: selectedEdges });
    }

    window.addEventListener("keydown", handleDeleteKey);
    return () => window.removeEventListener("keydown", handleDeleteKey);
  }, [onDelete, selectedEdges, selectedNodes]);

  const handleZoomIn = useCallback(() => {
    zoomIn({ duration: CANVAS_ZOOM_DURATION });
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut({ duration: CANVAS_ZOOM_DURATION });
  }, [zoomOut]);

  const handleFitView = useCallback(() => {
    fitView({ duration: CANVAS_ZOOM_DURATION, padding: 0.2 });
  }, [fitView]);

  const handleImportTemplate = useCallback(
    (template: CanvasTemplate) => {
      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;

      if (currentEdges.length > 0) {
        onEdgesChange(
          currentEdges.map((edge) => ({
            type: "remove" as const,
            id: edge.id,
          })),
        );
      }
      if (currentNodes.length > 0) {
        onNodesChange(
          currentNodes.map((node) => ({
            type: "remove" as const,
            id: node.id,
          })),
        );
      }

      onNodesChange(
        template.nodes.map((item) => ({
          type: "add" as const,
          item: structuredClone(item),
        })),
      );
      onEdgesChange(
        template.edges.map((item) => ({
          type: "add" as const,
          item: structuredClone(item),
        })),
      );

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          fitView({ duration: CANVAS_ZOOM_DURATION, padding: 0.2 });
        });
      });
    },
    [fitView, onEdgesChange, onNodesChange],
  );

  useEffect(() => {
    registerImporter(handleImportTemplate);
    return () => registerImporter(null);
  }, [handleImportTemplate, registerImporter]);

  const didInitialFit = useRef(false);
  useEffect(() => {
    if (didInitialFit.current) {
      return;
    }

    if (nodes.length === 0) {
      const timeout = window.setTimeout(() => {
        if (didInitialFit.current || nodesRef.current.length > 0) {
          return;
        }
        fitView({ duration: CANVAS_ZOOM_DURATION, padding: 0.2 });
        didInitialFit.current = true;
      }, 0);
      return () => window.clearTimeout(timeout);
    }

    const unmeasured = nodes.some(
      (node) =>
        typeof node.width !== "number" || typeof node.height !== "number",
    );
    if (unmeasured) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      fitView({ duration: CANVAS_ZOOM_DURATION, padding: 0.2 });
      didInitialFit.current = true;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [fitView, nodes]);

  const handleLabelChange = useCallback(
    (nodeId: string, label: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      onNodesChange([
        {
          type: "replace",
          id: nodeId,
          item: {
            ...node,
            data: { ...node.data, label },
          },
        },
      ]);
    },
    [onNodesChange, nodes],
  );

  const handleColorChange = useCallback(
    (nodeId: string, pair: NodeColorPair) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      onNodesChange([
        {
          type: "replace",
          id: nodeId,
          item: {
            ...node,
            data: {
              ...node.data,
              color: pair.fill,
              textColor: pair.text,
            },
          },
        },
      ]);
    },
    [onNodesChange, nodes],
  );

  const handleEdgeLabelChange = useCallback(
    (edgeId: string, label: string) => {
      const edge = edges.find((item) => item.id === edgeId);
      if (!edge) return;
      onEdgesChange([
        {
          type: "replace",
          id: edgeId,
          item: {
            ...edge,
            type: "canvasEdge",
            data: { ...edge.data, label },
          },
        },
      ]);
    },
    [onEdgesChange, edges],
  );

  const hydratedMissingSize = useRef(false);
  useEffect(() => {
    if (hydratedMissingSize.current || nodes.length === 0) {
      return;
    }
    const changes = nodes.flatMap((node) => {
      if (typeof node.width === "number" && typeof node.height === "number") {
        return [];
      }
      const defaults = DEFAULT_SHAPE_SIZES[node.data.shape] ?? {
        width: 200,
        height: 100,
      };
      const width = resolveNodeSize(
        node.style?.width ?? node.width,
        defaults.width,
      );
      const height = resolveNodeSize(
        node.style?.height ?? node.height,
        defaults.height,
      );
      return [
        {
          type: "replace" as const,
          id: node.id,
          item: {
            ...node,
            width,
            height,
            style: { ...node.style, width, height },
          },
        },
      ];
    });
    hydratedMissingSize.current = true;
    if (changes.length > 0) {
      onNodesChange(changes);
    }
  }, [nodes, onNodesChange]);

  const [dragPreview, setDragPreview] = useState<{
    shape: CanvasShape;
    clientX: number;
    clientY: number;
  } | null>(null);
  const draggingShape = Boolean(dragPreview);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragPreview((current) =>
      current
        ? { ...current, clientX: e.clientX, clientY: e.clientY }
        : current,
    );
  }, []);

  const handleDragStart = useCallback(
    (e: React.DragEvent, shape: CanvasShape) => {
      const rect = e.currentTarget.getBoundingClientRect();
      e.dataTransfer.setDragImage(
        e.currentTarget,
        e.clientX - rect.left,
        e.clientY - rect.top,
      );
      setDragPreview({ shape, clientX: e.clientX, clientY: e.clientY });
    },
    [],
  );

  const handleDragEnd = useCallback(() => {
    setDragPreview(null);
  }, []);

  useEffect(() => {
    if (!draggingShape) {
      return;
    }

    function onWindowDragOver(event: DragEvent) {
      setDragPreview((current) =>
        current
          ? { ...current, clientX: event.clientX, clientY: event.clientY }
          : current,
      );
    }

    function onWindowDragEnd() {
      setDragPreview(null);
    }

    window.addEventListener("dragover", onWindowDragOver);
    window.addEventListener("dragend", onWindowDragEnd);
    window.addEventListener("drop", onWindowDragEnd);
    return () => {
      window.removeEventListener("dragover", onWindowDragOver);
      window.removeEventListener("dragend", onWindowDragEnd);
      window.removeEventListener("drop", onWindowDragEnd);
    };
  }, [draggingShape]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragPreview(null);

      const payload = readShapeDragPayload(e.dataTransfer);
      if (!payload) {
        return;
      }

      const { shape, width, height } = payload;
      const cursorPosition = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });
      const position = {
        x: cursorPosition.x - width / 2,
        y: cursorPosition.y - height / 2,
      };
      const nodeId = crypto.randomUUID();

      if (nodesRef.current.length === 0 && edgesRef.current.length === 0) {
        didInitialFit.current = true;
      }

      const newNode: CanvasNode = {
        id: nodeId,
        type: "canvasNode",
        position,
        width,
        height,
        data: {
          label: "",
          color: DEFAULT_NODE_COLOR,
          textColor: DEFAULT_NODE_TEXT_COLOR,
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

  const dragPreviewElement = dragPreview ? (
    <div
      className="pointer-events-none fixed z-50 opacity-60"
      style={{
        left: dragPreview.clientX,
        top: dragPreview.clientY,
        transform: "translate(-50%, -50%)",
      }}
    >
      {renderShapeContent({
        shape: dragPreview.shape,
        width: DEFAULT_SHAPE_SIZES[dragPreview.shape].width,
        height: DEFAULT_SHAPE_SIZES[dragPreview.shape].height,
        fill: DEFAULT_NODE_COLOR,
        textColor: DEFAULT_NODE_TEXT_COLOR,
        selected: false,
        label: "",
        hideLabel: true,
      })}
    </div>
  ) : null;

  return (
    <div
      className="relative h-full min-h-0 w-full flex-1 bg-base"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
    >
      <NodeActionsContext.Provider
        value={{
          onLabelChange: handleLabelChange,
          onColorChange: handleColorChange,
        }}
      >
        <EdgeActionsContext.Provider
          value={{ onLabelChange: handleEdgeLabelChange }}
        >
          <ReactFlow
            className="h-full min-h-0 w-full bg-base"
            colorMode="dark"
            fitView
            fitViewOptions={{ padding: 0.2, duration: CANVAS_ZOOM_DURATION }}
            connectionMode={ConnectionMode.Loose}
            connectionLineType={ConnectionLineType.SmoothStep}
            connectionLineStyle={{
              stroke: DEFAULT_EDGE_COLOR,
              strokeWidth: DEFAULT_EDGE_STROKE_WIDTH,
              strokeLinecap: "round",
              opacity: 0.7,
            }}
            defaultEdgeOptions={defaultEdgeOptions}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDelete={onDelete}
            deleteKeyCode={null}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            nodeTypes={canvasNodeTypes}
            edgeTypes={canvasEdgeTypes}
          >
            <Background
              variant={BackgroundVariant.Dots}
              color="color-mix(in srgb, var(--text-primary) 16%, transparent)"
              gap={20}
              size={1}
            />
            <Cursors components={{ Cursor: FlowCursor }} />
          </ReactFlow>
        </EdgeActionsContext.Provider>
      </NodeActionsContext.Provider>
      <ParticipantAvatars />
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex items-center px-4">
        <div className="pointer-events-auto">
          <CanvasControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitView={handleFitView}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        </div>
        <div className="pointer-events-auto absolute left-1/2 -translate-x-1/2">
          <ShapePanel onDragStart={handleDragStart} />
        </div>
      </div>
      {dragPreviewElement}
    </div>
  );
}

function CanvasContent({ projectId }: { projectId: string }) {
  return (
    <ReactFlowProvider>
      <RoomConnectionStatus />
      <CanvasFlow projectId={projectId} />
    </ReactFlowProvider>
  );
}

export function CanvasWrapper({ roomId }: CanvasWrapperProps) {
  return (
    <ErrorBoundary fallback={<CanvasErrorFallback />}>
      <ClientSideSuspense fallback={<CanvasLoadingFallback />}>
        <CanvasContent projectId={roomId} />
      </ClientSideSuspense>
    </ErrorBoundary>
  );
}
