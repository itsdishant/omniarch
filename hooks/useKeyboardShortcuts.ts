"use client";

import { useEffect } from "react";
import type { ReactFlowInstance } from "@xyflow/react";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

const ZOOM_DURATION = 200;

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest(
      "input, textarea, select, [contenteditable]:not([contenteditable='false'])",
    ),
  );
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
      if (isEditableTarget(event.target)) {
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

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        reactFlow.zoomIn({ duration: ZOOM_DURATION });
        return;
      }

      if (event.key === "-") {
        event.preventDefault();
        reactFlow.zoomOut({ duration: ZOOM_DURATION });
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [reactFlow, redo, undo]);
}
