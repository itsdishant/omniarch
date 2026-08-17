import type { Node, Edge } from "@xyflow/react";

export type CanvasShape =
  | "rectangle"
  | "diamond"
  | "circle"
  | "pill"
  | "cylinder"
  | "hexagon";

export interface CanvasNodeData {
  label: string;
  color: string;
  shape: CanvasShape;
  [key: string]: unknown;
}

export interface CanvasNode extends Node<CanvasNodeData> {
  type: "canvasNode";
}

export interface CanvasEdge extends Edge {
  type: "canvasEdge";
}

export type CanvasNodeType = CanvasNode;
export type CanvasEdgeType = CanvasEdge;

// Default sizes for each shape
export const DEFAULT_SHAPE_SIZES: Record<CanvasShape, { width: number; height: number }> = {
  rectangle: { width: 200, height: 100 },
  diamond: { width: 180, height: 180 },
  circle: { width: 120, height: 120 },
  pill: { width: 180, height: 80 },
  cylinder: { width: 140, height: 160 },
  hexagon: { width: 150, height: 130 },
};

// Default color for new nodes
export const DEFAULT_NODE_COLOR = "#6366f1";

// Shape icons for the panel
export const SHAPE_ICONS: Record<CanvasShape, string> = {
  rectangle: "square",
  diamond: "diamond",
  circle: "circle",
  pill: "pill",
  cylinder: "cylinder",
  hexagon: "hexagon",
};

// Shape display names
export const SHAPE_NAMES: Record<CanvasShape, string> = {
  rectangle: "Rectangle",
  diamond: "Diamond",
  circle: "Circle",
  pill: "Pill",
  cylinder: "Cylinder",
  hexagon: "Hexagon",
};