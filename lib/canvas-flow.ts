import { LiveMap, LiveObject, type JsonObject } from "@liveblocks/core";
import type { LiveblocksEdge, LiveblocksNode } from "@liveblocks/react-flow";

import { getLiveblocksClient } from "@/lib/liveblocks";
import {
  DEFAULT_EDGE_COLOR,
  DEFAULT_EDGE_STROKE_WIDTH,
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_TEXT_COLOR,
  DEFAULT_SHAPE_SIZES,
  NODE_COLORS,
  resolveNodeColorPair,
  type CanvasEdge,
  type CanvasNode,
  type CanvasShape,
} from "@/types/canvas";

const GRID = 20;
const NODE_SYNC = {
  selected: false,
  dragging: false,
  measured: false,
  resizing: false,
  position: "atomic",
  sourcePosition: "atomic",
  targetPosition: "atomic",
  extent: "atomic",
  origin: "atomic",
  handles: "atomic",
} as const;

const EDGE_SYNC = {
  selected: false,
  markerStart: "atomic",
  markerEnd: "atomic",
  label: "atomic",
  labelBgPadding: "atomic",
} as const;

export const ALLOWED_SHAPES = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
] as const;

const SHAPES = new Set<CanvasShape>(ALLOWED_SHAPES);

export type DesignAction =
  | {
      type: "add_node";
      id: string;
      shape: CanvasShape;
      x: number;
      y: number;
      label: string;
      color?: string;
      width?: number;
      height?: number;
    }
  | { type: "move_node"; id: string; x: number; y: number }
  | { type: "resize_node"; id: string; width: number; height: number }
  | {
      type: "update_node_data";
      id: string;
      label?: string;
      color?: string;
      shape?: CanvasShape;
    }
  | { type: "delete_node"; id: string }
  | {
      type: "add_edge";
      id: string;
      source: string;
      target: string;
      label?: string;
    }
  | { type: "delete_edge"; id: string };

interface FlowMaps {
  nodes: LiveMap<string, LiveblocksNode<CanvasNode>>;
  edges: LiveMap<string, LiveblocksEdge<CanvasEdge>>;
}

function snap(value: number) {
  return Math.round(value / GRID) * GRID;
}

function isAllowedColor(fill: string) {
  return NODE_COLORS.some((pair) => pair.fill === fill);
}

export interface DesignPlanAction {
  type: string;
  id: string;
  shape: string | null;
  x: number | null;
  y: number | null;
  label: string | null;
  color: string | null;
  width: number | null;
  height: number | null;
  source: string | null;
  target: string | null;
}

function asCanvasShape(value: string | null | undefined): CanvasShape {
  return value && SHAPES.has(value as CanvasShape)
    ? (value as CanvasShape)
    : "rectangle";
}

function convertPlanAction(
  action: DesignPlanAction,
  index: number,
): DesignAction | null {
  const type = action.type.trim().toLowerCase().replace(/-/g, "_");
  const id = action.id.trim();
  if (!id) return null;

  switch (type) {
    case "add_node":
      if (action.x == null || action.y == null) return null;
      return {
        type: "add_node",
        id: id || `ai-node-${Date.now()}-${index}`,
        shape: asCanvasShape(action.shape),
        x: action.x,
        y: action.y,
        label: action.label?.trim() || "Component",
        color: action.color ?? undefined,
        width: action.width ?? undefined,
        height: action.height ?? undefined,
      };
    case "move_node":
      if (action.x == null || action.y == null) return null;
      return { type: "move_node", id, x: action.x, y: action.y };
    case "resize_node":
      if (action.width == null || action.height == null) return null;
      return {
        type: "resize_node",
        id,
        width: action.width,
        height: action.height,
      };
    case "update_node_data":
      return {
        type: "update_node_data",
        id,
        label: action.label ?? undefined,
        color: action.color ?? undefined,
        shape: action.shape ? asCanvasShape(action.shape) : undefined,
      };
    case "delete_node":
      return { type: "delete_node", id };
    case "add_edge": {
      const source = action.source?.trim();
      const target = action.target?.trim();
      if (!source || !target) return null;
      return {
        type: "add_edge",
        id,
        source,
        target,
        label: action.label ?? undefined,
      };
    }
    case "delete_edge":
      return { type: "delete_edge", id };
    default:
      return null;
  }
}

export function mapPlanActionsToDesignActions(
  actions: DesignPlanAction[],
): DesignAction[] {
  return sanitizeDesignActions(
    actions.flatMap((action, index) => {
      const converted = convertPlanAction(action, index);
      return converted ? [converted] : [];
    }),
  );
}

export function sanitizeDesignActions(actions: DesignAction[]): DesignAction[] {
  return actions.map((action, index) => {
    if (action.type === "add_node") {
      const shape = SHAPES.has(action.shape) ? action.shape : "rectangle";
      const defaults = DEFAULT_SHAPE_SIZES[shape];
      const color =
        action.color && isAllowedColor(action.color)
          ? action.color
          : DEFAULT_NODE_COLOR;

      const width = snap(action.width ?? defaults.width) || defaults.width;
      const height = snap(action.height ?? defaults.height) || defaults.height;
      const size = shape === "circle" ? Math.min(width, height) : null;

      return {
        ...action,
        id: action.id.trim() || `ai-${shape}-${Date.now()}-${index}`,
        shape,
        x: snap(action.x),
        y: snap(action.y),
        label: action.label.trim() || "Component",
        color,
        width: size ?? width,
        height: size ?? height,
      };
    }

    if (action.type === "move_node") {
      return { ...action, x: snap(action.x), y: snap(action.y) };
    }

    if (action.type === "resize_node") {
      return {
        ...action,
        width: Math.max(GRID, snap(action.width)),
        height: Math.max(GRID, snap(action.height)),
      };
    }

    if (action.type === "update_node_data") {
      return {
        ...action,
        label: action.label?.trim(),
        color:
          action.color && isAllowedColor(action.color)
            ? action.color
            : action.color
              ? DEFAULT_NODE_COLOR
              : undefined,
        shape:
          action.shape && SHAPES.has(action.shape) ? action.shape : undefined,
      };
    }

    return action;
  });
}

function createCanvasNode(action: Extract<DesignAction, { type: "add_node" }>) {
  const shape = action.shape;
  const width = action.width ?? DEFAULT_SHAPE_SIZES[shape].width;
  const height = action.height ?? DEFAULT_SHAPE_SIZES[shape].height;
  const pair = resolveNodeColorPair(action.color);

  const node: CanvasNode = {
    id: action.id,
    type: "canvasNode",
    position: { x: action.x, y: action.y },
    width,
    height,
    data: {
      label: action.label,
      color: pair.fill,
      textColor: pair.text,
      shape,
    },
    style: { width, height },
  };

  return node;
}

function createCanvasEdge(
  id: string,
  source: string,
  target: string,
  label = "",
): CanvasEdge {
  return {
    id,
    source,
    target,
    type: "canvasEdge",
    data: { label },
    markerEnd: {
      type: "arrowclosed",
      color: DEFAULT_EDGE_COLOR,
      width: 16,
      height: 16,
    },
    style: {
      stroke: DEFAULT_EDGE_COLOR,
      strokeWidth: DEFAULT_EDGE_STROKE_WIDTH,
      strokeLinecap: "round",
    },
  };
}

function getFlowMaps(root: LiveObject<Liveblocks["Storage"]>): FlowMaps {
  let flow = root.get("flow");
  if (!flow) {
    flow = new LiveObject({
      nodes: new LiveMap(),
      edges: new LiveMap(),
    });
    root.set("flow", flow);
  }

  let nodes = flow.get("nodes");
  let edges = flow.get("edges");
  if (!nodes) {
    nodes = new LiveMap();
    flow.set("nodes", nodes);
  }
  if (!edges) {
    edges = new LiveMap();
    flow.set("edges", edges);
  }

  return { nodes, edges };
}

function applyAction(flow: FlowMaps, action: DesignAction) {
  const { nodes, edges } = flow;

  switch (action.type) {
    case "add_node": {
      const node = createCanvasNode(action);
      nodes.set(
        node.id,
        LiveObject.from(
          node as unknown as JsonObject,
          NODE_SYNC,
        ) as LiveblocksNode<CanvasNode>,
      );
      return node.position;
    }
    case "move_node": {
      const node = nodes.get(action.id);
      if (!node) return null;
      node.set("position", { x: action.x, y: action.y });
      return { x: action.x, y: action.y };
    }
    case "resize_node": {
      const node = nodes.get(action.id);
      if (!node) return null;
      let width = action.width;
      let height = action.height;
      const data = node.get("data") as
        | { get?: (key: string) => unknown; shape?: CanvasShape }
        | undefined;
      const shape =
        data && typeof data.get === "function"
          ? data.get("shape")
          : data?.shape;
      if (shape === "circle") {
        const size = Math.min(width, height);
        width = size;
        height = size;
      }
      node.set("width", width);
      node.set("height", height);
      return (
        (node.get("position") as { x: number; y: number } | undefined) ?? null
      );
    }
    case "update_node_data": {
      const node = nodes.get(action.id);
      if (!node) return null;
      const data = node.get("data") as
        | LiveObject<{
            label: string;
            color: string;
            textColor?: string;
            shape: CanvasShape;
          }>
        | undefined;
      if (!data || typeof data.set !== "function") return null;
      if (action.label !== undefined) data.set("label", action.label);
      if (action.shape) data.set("shape", action.shape);
      if (action.color) {
        const pair = resolveNodeColorPair(action.color);
        data.set("color", pair.fill);
        data.set("textColor", pair.text);
      }
      return (node.get("position") as { x: number; y: number } | undefined) ?? null;
    }
    case "delete_node": {
      for (const [edgeId, edge] of edges.entries()) {
        if (
          edge.get("source") === action.id ||
          edge.get("target") === action.id
        ) {
          edges.delete(edgeId);
        }
      }
      nodes.delete(action.id);
      return null;
    }
    case "add_edge": {
      if (!nodes.get(action.source) || !nodes.get(action.target)) return null;
      const edge = createCanvasEdge(
        action.id,
        action.source,
        action.target,
        action.label ?? "",
      );
      edges.set(
        edge.id,
        LiveObject.from(
          edge as unknown as JsonObject,
          EDGE_SYNC,
        ) as LiveblocksEdge<CanvasEdge>,
      );
      const source = nodes.get(action.source);
      return (source?.get("position") as { x: number; y: number } | undefined) ?? null;
    }
    case "delete_edge": {
      edges.delete(action.id);
      return null;
    }
  }
}

export async function readCanvasGraph(roomId: string): Promise<{
  nodes: Array<{
    id: string;
    label: string;
    shape: string;
    color: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
  }>;
}> {
  const liveblocks = getLiveblocksClient();
  let document: {
    flow?: {
      nodes?: Record<string, Record<string, unknown>>;
      edges?: Record<string, Record<string, unknown>>;
    };
  };

  try {
    document = (await liveblocks.getStorageDocument(
      roomId,
      "json",
    )) as typeof document;
  } catch {
    return { nodes: [], edges: [] };
  }

  const nodes = Object.values(document.flow?.nodes ?? {}).flatMap((node) => {
    if (typeof node.id !== "string") return [];
    const position = node.position as { x?: number; y?: number } | undefined;
    const data = node.data as
      | { label?: string; shape?: string; color?: string }
      | undefined;
    return [
      {
        id: node.id,
        label: data?.label ?? "",
        shape: data?.shape ?? "rectangle",
        color: data?.color ?? DEFAULT_NODE_COLOR,
        x: typeof position?.x === "number" ? position.x : 0,
        y: typeof position?.y === "number" ? position.y : 0,
        width: typeof node.width === "number" ? node.width : undefined,
        height: typeof node.height === "number" ? node.height : undefined,
      },
    ];
  });

  const edges = Object.values(document.flow?.edges ?? {}).flatMap((edge) => {
    if (
      typeof edge.id !== "string" ||
      typeof edge.source !== "string" ||
      typeof edge.target !== "string"
    ) {
      return [];
    }
    const data = edge.data as { label?: string } | undefined;
    return [
      {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: data?.label,
      },
    ];
  });

  return { nodes, edges };
}

export async function applyDesignActions(
  roomId: string,
  actions: DesignAction[],
  onCursor?: (cursor: { x: number; y: number }) => Promise<void>,
) {
  const liveblocks = getLiveblocksClient();
  const sanitized = sanitizeDesignActions(actions);

  await liveblocks.mutateStorage(roomId, ({ root }) => {
    const flow = getFlowMaps(root);

    for (const action of sanitized) {
      applyAction(flow, action);
    }
  });

  const lastPosition = sanitized.reduce<{ x: number; y: number } | null>(
    (cursor, action) => {
      if (action.type === "add_node" || action.type === "move_node") {
        return { x: action.x, y: action.y };
      }
      return cursor;
    },
    null,
  );

  if (lastPosition && onCursor) {
    await onCursor(lastPosition);
  }
}

export const ALLOWED_NODE_COLORS = NODE_COLORS.map((pair) => pair.fill);
export { DEFAULT_NODE_COLOR, DEFAULT_NODE_TEXT_COLOR };
