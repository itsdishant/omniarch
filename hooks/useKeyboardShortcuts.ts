"use client";

import { useEffect } from "react";
import type { ReactFlowInstance } from "@xyflow/react";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

const ZOOM_DURATION = 200;

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(
    target.closest(
      "input, textarea, select, [contenteditable]:not([contenteditable='false'])",
    ),
  );
}

function isDialogTarget(target: EventTarget | null) {
  return target instanceof Element && target.closest('[role="dialog"]') !== null;
}

export function useKeyboardShortcuts({
  reactFlow,
  undo,
  redo,
}: {
  reactFlow: ReactFlowInstance<CanvasNode, CanvasEdge>;
  undo: () => void;
  redo: () => void;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target) || isDialogTarget(event.target)) {
        return;
      }

      const isMod = event.metaKey || event.ctrlKey;

      if (isMod && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if (isMod && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
        return;
      }

      if (!isMod && (event.key === "+" || event.key === "=")) {
        event.preventDefault();
        reactFlow.zoomIn({ duration: ZOOM_DURATION });
        return;
      }

      if (!isMod && event.key === "-") {
        event.preventDefault();
        reactFlow.zoomOut({ duration: ZOOM_DURATION });
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [reactFlow, redo, undo]);
}
