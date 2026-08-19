"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

export type CanvasSaveStatus = "idle" | "saving" | "saved" | "error";

interface CanvasSaveStatusContextValue {
  saveStatus: CanvasSaveStatus;
  saveNow: () => void;
  setSaveHandler: (handler: () => void) => void;
  setSaveStatus: (status: CanvasSaveStatus) => void;
}

const CanvasSaveStatusContext =
  createContext<CanvasSaveStatusContextValue | null>(null);

export function CanvasSaveStatusProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [saveStatus, setSaveStatus] = useState<CanvasSaveStatus>("idle");
  const [saveHandler, setSaveHandlerState] = useState<() => void>(
    () => undefined,
  );
  const setSaveHandler = useCallback((handler: () => void) => {
    setSaveHandlerState(() => handler);
  }, []);
  const saveNow = useCallback(() => saveHandler(), [saveHandler]);

  return createElement(
    CanvasSaveStatusContext.Provider,
    { value: { saveNow, saveStatus, setSaveHandler, setSaveStatus } },
    children,
  );
}

export function useCanvasSaveStatus() {
  const context = useContext(CanvasSaveStatusContext);
  if (!context) {
    throw new Error(
      "useCanvasSaveStatus must be used within CanvasSaveStatusProvider",
    );
  }
  return context;
}

interface UseCanvasAutosaveOptions {
  projectId: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  onLoad: (nodes: CanvasNode[], edges: CanvasEdge[]) => void;
}

interface SavedCanvas {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

function isSavedCanvas(value: unknown): value is SavedCanvas {
  if (!value || typeof value !== "object") return false;
  const canvas = value as Partial<SavedCanvas>;
  return Array.isArray(canvas.nodes) && Array.isArray(canvas.edges);
}

export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
  onLoad,
}: UseCanvasAutosaveOptions) {
  const { setSaveStatus } = useCanvasSaveStatus();
  const { setSaveHandler } = useCanvasSaveStatus();
  const hasCheckedSavedCanvas = useRef(false);
  const isLoadingSavedCanvas = useRef(false);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const resetStatusTimeout = useRef<number | null>(null);

  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [edges, nodes]);

  const loadSavedCanvas = useCallback(async () => {
    if (hasCheckedSavedCanvas.current || isLoadingSavedCanvas.current) return;
    isLoadingSavedCanvas.current = true;

    try {
      if (nodesRef.current.length > 0 || edgesRef.current.length > 0) {
        hasCheckedSavedCanvas.current = true;
        return;
      }

      const response = await fetch(`/api/projects/${projectId}/canvas`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Unable to load saved canvas");

      const body: unknown = await response.json();
      if (body && typeof body === "object" && "canvas" in body) {
        const canvas = (body as { canvas?: unknown }).canvas;
        if (
          nodesRef.current.length === 0 &&
          edgesRef.current.length === 0 &&
          isSavedCanvas(canvas) &&
          (canvas.nodes.length > 0 || canvas.edges.length > 0)
        ) {
          onLoad(canvas.nodes, canvas.edges);
        }
      }
      hasCheckedSavedCanvas.current = true;
    } catch {
      hasCheckedSavedCanvas.current = true;
      setSaveStatus("error");
    } finally {
      isLoadingSavedCanvas.current = false;
    }
  }, [onLoad, projectId, setSaveStatus]);

  useEffect(() => {
    void loadSavedCanvas();
  }, [loadSavedCanvas]);

  const saveCanvas = useCallback(async () => {
    if (resetStatusTimeout.current !== null) {
      window.clearTimeout(resetStatusTimeout.current);
    }
    setSaveStatus("saving");

    try {
      const response = await fetch(`/api/projects/${projectId}/canvas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, edges }),
      });
      if (!response.ok) throw new Error("Unable to save canvas");
      setSaveStatus("saved");
      resetStatusTimeout.current = window.setTimeout(() => {
        setSaveStatus("idle");
      }, 1200);
    } catch {
      setSaveStatus("error");
      resetStatusTimeout.current = window.setTimeout(() => {
        setSaveStatus("idle");
      }, 1600);
    }
  }, [edges, nodes, projectId, setSaveStatus]);

  useEffect(() => {
    setSaveHandler(() => void saveCanvas());
    return () => setSaveHandler(() => undefined);
  }, [saveCanvas, setSaveHandler]);

  useEffect(() => {
    if (!hasCheckedSavedCanvas.current) return;

    setSaveStatus("saving");
    const timeout = window.setTimeout(() => void saveCanvas(), 800);

    return () => window.clearTimeout(timeout);
  }, [edges, nodes, saveCanvas, setSaveStatus]);
}
