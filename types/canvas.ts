import type { Node, Edge } from "@xyflow/react";

export type CanvasShape =
  | "rectangle"
  | "diamond"
  | "circle"
  | "pill"
  | "cylinder"
  | "hexagon";

export interface NodeColorPair {
  fill: string;
  text: string;
  label: string;
}

export interface CanvasNodeData {
  label: string;
  color: string;
  textColor?: string;
  shape: CanvasShape;
  [key: string]: unknown;
}

export interface CanvasNode extends Node<CanvasNodeData> {
  type: "canvasNode";
}

export interface CanvasEdgeData {
  label?: string;
  [key: string]: unknown;
}

export interface CanvasEdge extends Edge<CanvasEdgeData> {
  type: "canvasEdge";
}

export const DEFAULT_EDGE_COLOR = "#f8fafc";
export const DEFAULT_EDGE_STROKE_WIDTH = 1.25;

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

export const NODE_COLORS: NodeColorPair[] = [
  { fill: "#1F1F1F", text: "#EDEDED", label: "Neutral" },
  { fill: "#10233D", text: "#52A8FF", label: "Blue" },
  { fill: "#2E1938", text: "#BF7AF0", label: "Purple" },
  { fill: "#331B00", text: "#FF990A", label: "Orange" },
  { fill: "#3C1618", text: "#FF6166", label: "Red" },
  { fill: "#3A1726", text: "#F75F8F", label: "Pink" },
  { fill: "#0F2E18", text: "#62C073", label: "Green" },
  { fill: "#062822", text: "#0AC7B4", label: "Teal" },
];

export const DEFAULT_NODE_COLOR = NODE_COLORS[0].fill;
export const DEFAULT_NODE_TEXT_COLOR = NODE_COLORS[0].text;

export function resolveNodeColorPair(
  fill?: string,
  text?: string,
): NodeColorPair {
  const match = NODE_COLORS.find((pair) => pair.fill === fill);
  if (match) {
    return match;
  }

  return {
    fill: fill || DEFAULT_NODE_COLOR,
    text: text || DEFAULT_NODE_TEXT_COLOR,
    label: "Custom",
  };
}

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