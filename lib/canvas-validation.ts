import type { CanvasEdge, CanvasNode } from "@/types/canvas";

const CANVAS_SHAPES = new Set([
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isCanvasNode(value: unknown): value is CanvasNode {
  if (!isRecord(value) || typeof value.id !== "string" || value.id === "") {
    return false;
  }

  if (value.type !== "canvasNode" || !isRecord(value.position)) return false;
  if (!isFiniteNumber(value.position.x) || !isFiniteNumber(value.position.y)) {
    return false;
  }

  const data = value.data;
  return (
    isRecord(data) &&
    typeof data.label === "string" &&
    typeof data.color === "string" &&
    typeof data.shape === "string" &&
    CANVAS_SHAPES.has(data.shape)
  );
}

function isCanvasEdge(value: unknown): value is CanvasEdge {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    value.id !== "" &&
    typeof value.source === "string" &&
    value.source !== "" &&
    typeof value.target === "string" &&
    value.target !== "" &&
    value.type === "canvasEdge"
  );
}

export function isCanvasSnapshot(value: unknown): value is {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
} {
  if (
    !isRecord(value) ||
    !Array.isArray(value.nodes) ||
    !Array.isArray(value.edges)
  ) {
    return false;
  }

  if (!value.nodes.every(isCanvasNode) || !value.edges.every(isCanvasEdge)) {
    return false;
  }

  const nodeIds = new Set(value.nodes.map((node) => node.id));
  if (nodeIds.size !== value.nodes.length) return false;

  const edgeIds = new Set<string>();
  return value.edges.every((edge) => {
    if (
      edgeIds.has(edge.id) ||
      !nodeIds.has(edge.source) ||
      !nodeIds.has(edge.target)
    ) {
      return false;
    }
    edgeIds.add(edge.id);
    return true;
  });
}
