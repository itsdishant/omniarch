"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";

import type { CanvasEdge } from "@/types/canvas";
import { DEFAULT_EDGE_COLOR, DEFAULT_EDGE_STROKE_WIDTH } from "@/types/canvas";

export const EdgeActionsContext = createContext<{
  onLabelChange: (edgeId: string, label: string) => void;
} | null>(null);

function sanitizeEdgeLabel(value: string) {
  return value.replace(/[\r\n]+/g, "");
}

export function CanvasEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
  markerEnd,
  style,
}: EdgeProps<CanvasEdge>) {
  const { onLabelChange } = useContext(EdgeActionsContext)!;
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 8,
  });

  const savedLabel = sanitizeEdgeLabel(data?.label ?? "");
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(savedLabel);
  const inputRef = useRef<HTMLInputElement>(null);
  const isActive = Boolean(selected) || isHovered;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commitLabel = () => {
    setIsEditing(false);
    const nextLabel = sanitizeEdgeLabel(editLabel);
    if (nextLabel !== savedLabel) {
      onLabelChange(id, nextLabel);
    }
  };

  const startEditing = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setEditLabel(savedLabel);
    setIsEditing(true);
  };

  const showHint = isActive && !isEditing && savedLabel.length === 0;
  const showBadge = !isEditing && savedLabel.length > 0;
  const displayedEditLabel = isEditing ? editLabel : savedLabel;
  const measureText = isEditing
    ? displayedEditLabel || "Label"
    : savedLabel || (showHint ? "Label" : "");

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        interactionWidth={24}
        style={{
          ...style,
          stroke: DEFAULT_EDGE_COLOR,
          strokeWidth: DEFAULT_EDGE_STROKE_WIDTH,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          opacity: isActive ? 1 : 0.42,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={startEditing}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan nowheel pointer-events-auto absolute"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          onDoubleClick={startEditing}
        >
          {isEditing ? (
            <label className="inline-grid min-w-8 items-center rounded-full border border-surface-border bg-elevated/95 px-2 py-0.5 shadow-sm">
              <span className="invisible col-start-1 row-start-1 whitespace-pre text-[11px] font-medium leading-4">
                {measureText}
              </span>
              <input
                ref={inputRef}
                value={editLabel}
                aria-label="Edge label"
                onChange={(event) =>
                  setEditLabel(sanitizeEdgeLabel(event.target.value))
                }
                onBlur={commitLabel}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === "Escape") {
                    event.preventDefault();
                    commitLabel();
                  }
                }}
                onMouseDown={(event) => event.stopPropagation()}
                className="nodrag nopan nowheel col-start-1 row-start-1 w-full bg-transparent text-center text-[11px] font-medium leading-4 text-copy-primary outline-none"
                placeholder="Label"
                spellCheck={false}
              />
            </label>
          ) : showBadge ? (
            <span className="inline-flex max-w-48 truncate rounded-full border border-surface-border bg-elevated/95 px-2 py-0.5 text-[11px] font-medium leading-4 text-copy-primary shadow-sm">
              {savedLabel}
            </span>
          ) : showHint ? (
            <span className="inline-flex rounded-full border border-dashed border-surface-border/80 bg-elevated/60 px-2 py-0.5 text-[11px] font-medium leading-4 text-copy-faint">
              Label
            </span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
