"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  Handle,
  NodeResizer,
  NodeToolbar,
  Position,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";

import { renderShapeContent } from "@/components/editor/canvas-shapes";
import type { CanvasNode, CanvasShape, NodeColorPair } from "@/types/canvas";
import {
  DEFAULT_SHAPE_SIZES,
  NODE_COLORS,
  resolveNodeColorPair,
  SHAPE_NAMES,
} from "@/types/canvas";

const MIN_SHAPE_SIZES: Record<CanvasShape, { width: number; height: number }> =
  {
    rectangle: { width: 80, height: 50 },
    diamond: { width: 80, height: 80 },
    circle: { width: 60, height: 60 },
    pill: { width: 80, height: 40 },
    cylinder: { width: 80, height: 80 },
    hexagon: { width: 70, height: 60 },
  };

const HANDLE_CLASS =
  "!h-2 !w-2 !min-h-2 !min-w-2 !rounded-full !border !border-base !bg-white opacity-0 transition-opacity duration-150 group-hover:opacity-100";

type HandleSide = "top" | "right" | "bottom" | "left";

function getHandleStyle(
  shape: CanvasShape,
  side: HandleSide,
): CSSProperties | undefined {
  const inset =
    shape === "diamond"
      ? { x: "2%", y: "2%" }
      : shape === "hexagon"
        ? { x: "7%", y: "2%" }
        : null;

  if (!inset) {
    return undefined;
  }

  switch (side) {
    case "top":
      return {
        top: inset.y,
        bottom: "auto",
        left: "50%",
        right: "auto",
        transform: "translate(-50%, -50%)",
      };
    case "right":
      return {
        top: "50%",
        bottom: "auto",
        right: inset.x,
        left: "auto",
        transform: "translate(50%, -50%)",
      };
    case "bottom":
      return {
        bottom: inset.y,
        top: "auto",
        left: "50%",
        right: "auto",
        transform: "translate(-50%, 50%)",
      };
    case "left":
      return {
        top: "50%",
        bottom: "auto",
        left: inset.x,
        right: "auto",
        transform: "translate(-50%, -50%)",
      };
  }
}

interface NodeActionsContextType {
  onLabelChange: (nodeId: string, label: string) => void;
  onColorChange: (nodeId: string, pair: NodeColorPair) => void;
}

export const NodeActionsContext = createContext<NodeActionsContextType | null>(null);

function NodeColorToolbar({
  selected,
  activeFill,
  onSelect,
}: {
  selected: boolean;
  activeFill: string;
  onSelect: (pair: NodeColorPair) => void;
}) {
  return (
    <NodeToolbar
      isVisible={selected}
      position={Position.Top}
      offset={12}
      className="nodrag nopan nowheel"
    >
      <div
        className="nodrag nopan nowheel flex items-center gap-1.5 rounded-full border border-surface-border bg-elevated/95 px-1.5 py-1 shadow-lg backdrop-blur-sm"
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {NODE_COLORS.map((pair) => {
          const isActive = pair.fill === activeFill;
          return (
            <button
              key={pair.fill}
              type="button"
              title={pair.label}
              aria-label={`${pair.label} node color`}
              aria-pressed={isActive}
              className="nodrag nopan nowheel h-5 w-5 shrink-0 rounded-full border border-white/10 transition-[box-shadow,transform] hover:[box-shadow:0_0_0_1px_color-mix(in_srgb,var(--swatch-text)_55%,transparent),0_0_7px_0_color-mix(in_srgb,var(--swatch-text)_65%,transparent)]"
              style={{
                backgroundColor: pair.fill,
                ["--swatch-text" as string]: pair.text,
                boxShadow: isActive
                  ? `0 0 0 1.5px ${pair.text}, 0 0 0 3px color-mix(in srgb, ${pair.text} 28%, transparent)`
                  : undefined,
                transform: isActive ? "scale(1.08)" : undefined,
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(pair);
              }}
            />
          );
        })}
      </div>
    </NodeToolbar>
  );
}

export function resolveNodeSize(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return fallback;
}

function sanitizeNodeLabel(value: string) {
  return value.replace(/[\r\n]+/g, "");
}

function CanvasNodeComponent({
  data,
  selected,
  id,
  width: measuredWidth,
  height: measuredHeight,
}: NodeProps<CanvasNode>) {
  const { onLabelChange, onColorChange } = useContext(NodeActionsContext)!;
  const { label, color, textColor, shape } = data;
  const pair = resolveNodeColorPair(color, textColor);
  const defaults = DEFAULT_SHAPE_SIZES[shape] ?? { width: 200, height: 100 };
  const width = resolveNodeSize(measuredWidth ?? data.width, defaults.width);
  const height = resolveNodeSize(
    measuredHeight ?? data.height,
    defaults.height,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipCommitRef = useRef(false);

  const minSize = MIN_SHAPE_SIZES[shape];

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    skipCommitRef.current = false;
    setEditLabel(sanitizeNodeLabel(label));
    setIsEditing(true);
  };

  const commitLabel = () => {
    if (skipCommitRef.current) {
      skipCommitRef.current = false;
      setIsEditing(false);
      return;
    }
    setIsEditing(false);
    onLabelChange(id, sanitizeNodeLabel(editLabel));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      skipCommitRef.current = true;
      setEditLabel(label);
      setIsEditing(false);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      commitLabel();
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const shapeContent = renderShapeContent({
    shape,
    width,
    height,
    fill: pair.fill,
    textColor: pair.text,
    selected: Boolean(selected),
    label,
    hideLabel: isEditing,
  });

  return (
    <div
      className="group relative"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <NodeColorToolbar
        selected={Boolean(selected)}
        activeFill={pair.fill}
        onSelect={(nextPair) => onColorChange(id, nextPair)}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className={HANDLE_CLASS}
        style={getHandleStyle(shape, "left")}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        className={HANDLE_CLASS}
        style={getHandleStyle(shape, "top")}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className={HANDLE_CLASS}
        style={getHandleStyle(shape, "right")}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className={HANDLE_CLASS}
        style={getHandleStyle(shape, "bottom")}
      />
      {shapeContent}

      {isEditing ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <input
            ref={inputRef}
            value={editLabel}
            onChange={(e) => setEditLabel(sanitizeNodeLabel(e.target.value))}
            onBlur={commitLabel}
            onKeyDown={handleKeyDown}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="nodrag nopan nowheel max-w-full bg-transparent px-3 py-1.5 text-center text-sm font-medium outline-none"
            style={{
              color: pair.text,
              caretColor: pair.text,
            }}
            placeholder={SHAPE_NAMES[shape]}
            spellCheck={false}
          />
        </div>
      ) : (
        <div
          className="absolute inset-2"
          onDoubleClick={handleDoubleClick}
          style={{ cursor: selected ? "text" : "default" }}
        />
      )}
      <NodeResizer
        isVisible={Boolean(selected) && !isEditing}
        minWidth={minSize.width}
        minHeight={minSize.height}
        keepAspectRatio={shape === "circle"}
        color="var(--primary)"
        handleClassName="!h-3 !w-3 !rounded-sm !border !border-base !bg-primary"
      />
    </div>
  );
}

export const canvasNodeTypes: NodeTypes = {
  canvasNode: CanvasNodeComponent,
};
