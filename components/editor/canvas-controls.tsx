"use client";

import type { ReactNode } from "react";
import { Maximize2, Redo2, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

export const CANVAS_ZOOM_DURATION = 200;

function ControlButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full text-copy-secondary transition-colors",
        "hover:bg-subtle hover:text-copy-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        "disabled:pointer-events-none disabled:opacity-35",
      )}
    >
      {children}
    </button>
  );
}

interface CanvasControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function CanvasControls({
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: CanvasControlsProps) {
  return (
    <div
      className="flex items-center gap-0.5 rounded-full border border-surface-border bg-elevated/80 p-1 shadow-xl backdrop-blur-sm"
      role="toolbar"
      aria-label="Canvas controls"
    >
      <ControlButton label="Zoom out" onClick={onZoomOut}>
        <ZoomOut className="h-4 w-4" />
      </ControlButton>
      <ControlButton label="Fit view" onClick={onFitView}>
        <Maximize2 className="h-4 w-4" />
      </ControlButton>
      <ControlButton label="Zoom in" onClick={onZoomIn}>
        <ZoomIn className="h-4 w-4" />
      </ControlButton>
      <div
        aria-hidden="true"
        className="mx-1 h-5 w-px shrink-0 bg-surface-border"
      />
      <ControlButton label="Undo" disabled={!canUndo} onClick={onUndo}>
        <Undo2 className="h-4 w-4" />
      </ControlButton>
      <ControlButton label="Redo" disabled={!canRedo} onClick={onRedo}>
        <Redo2 className="h-4 w-4" />
      </ControlButton>
    </div>
  );
}
