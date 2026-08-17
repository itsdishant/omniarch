"use client";

import React, { useCallback } from "react";
import {
  Square,
  Diamond,
  Circle,
  Pill,
  Cylinder,
  Hexagon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CanvasShape } from "@/types/canvas";
import { DEFAULT_SHAPE_SIZES, SHAPE_NAMES } from "@/types/canvas";

export const SHAPE_DRAG_MIME = "application/omniarch-shape";

export interface ShapeDragPayload {
  shape: CanvasShape;
  width: number;
  height: number;
}

export function writeShapeDragPayload(
  dataTransfer: DataTransfer,
  shape: CanvasShape,
) {
  const size = DEFAULT_SHAPE_SIZES[shape];
  const payload = JSON.stringify({
    shape,
    width: size.width,
    height: size.height,
  } satisfies ShapeDragPayload);
  dataTransfer.setData(SHAPE_DRAG_MIME, payload);
  dataTransfer.setData("text/plain", payload);
  dataTransfer.effectAllowed = "copy";
}

function isCanvasShape(value: string): value is CanvasShape {
  return value in DEFAULT_SHAPE_SIZES;
}

export function readShapeDragPayload(
  dataTransfer: DataTransfer,
): ShapeDragPayload | null {
  const raw =
    dataTransfer.getData(SHAPE_DRAG_MIME) ||
    dataTransfer.getData("text/plain");
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ShapeDragPayload>;
    if (
      typeof parsed.shape !== "string" ||
      !isCanvasShape(parsed.shape) ||
      typeof parsed.width !== "number" ||
      typeof parsed.height !== "number"
    ) {
      return null;
    }
    return {
      shape: parsed.shape,
      width: parsed.width,
      height: parsed.height,
    };
  } catch {
    return null;
  }
}

interface ShapePanelProps {
  onDragStart?: (e: React.DragEvent, shape: CanvasShape) => void;
}

const shapeIcons: Record<CanvasShape, React.ComponentType<{ className?: string }>> = {
  rectangle: Square,
  diamond: Diamond,
  circle: Circle,
  pill: Pill,
  cylinder: Cylinder,
  hexagon: Hexagon,
};

const shapes: CanvasShape[] = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
];

export function ShapePanel({ onDragStart }: ShapePanelProps) {
  const handleDragStart = useCallback(
    (e: React.DragEvent, shape: CanvasShape) => {
      e.stopPropagation();
      writeShapeDragPayload(e.dataTransfer, shape);
      onDragStart?.(e, shape);
    },
    [onDragStart],
  );

  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-full bg-elevated/80 backdrop-blur-sm p-1 border border-surface-border shadow-xl"
      role="toolbar"
      aria-label="Shape tools"
    >
      {shapes.map((shape) => {
        const Icon = shapeIcons[shape];
        return (
          <button
            key={shape}
            type="button"
            draggable
            onDragStart={(e) => handleDragStart(e, shape)}
            className={cn(
              "relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
              "hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
              "text-copy-secondary hover:text-copy-primary",
              "active:scale-[0.95] cursor-grab active:cursor-grabbing",
            )}
            style={{ WebkitUserDrag: "element" } as React.CSSProperties}
            title={SHAPE_NAMES[shape]}
            aria-label={SHAPE_NAMES[shape]}
          >
            <Icon className="h-5 w-5 pointer-events-none" />
          </button>
        );
      })}
    </div>
  );
}