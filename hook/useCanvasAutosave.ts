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

import { isCanvasSnapshot } from "@/lib/canvas-validation";
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

interface CanvasSnapshot {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
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
  const pendingSnapshot = useRef<CanvasSnapshot | null>(null);
  const saveInProgress = useRef(false);

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
          isCanvasSnapshot(canvas) &&
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

  const saveCanvas = useCallback(
    async (snapshot: CanvasSnapshot) => {
      pendingSnapshot.current = snapshot;
      if (saveInProgress.current) return;

      saveInProgress.current = true;
      if (resetStatusTimeout.current !== null) {
        window.clearTimeout(resetStatusTimeout.current);
      }
      setSaveStatus("saving");

      try {
        while (pendingSnapshot.current) {
          const nextSnapshot = pendingSnapshot.current;
          pendingSnapshot.current = null;
          const response = await fetch(`/api/projects/${projectId}/canvas`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nextSnapshot),
          });
          if (!response.ok) throw new Error("Unable to save canvas");
        }
        setSaveStatus("saved");
        resetStatusTimeout.current = window.setTimeout(() => {
          setSaveStatus("idle");
        }, 1200);
      } catch {
        setSaveStatus("error");
        resetStatusTimeout.current = window.setTimeout(() => {
          setSaveStatus("idle");
        }, 1600);
      } finally {
        saveInProgress.current = false;
      }
    },
    [projectId, setSaveStatus],
  );

  const requestSave = useCallback(() => {
    void saveCanvas({ nodes, edges });
  }, [edges, nodes, saveCanvas]);

  useEffect(() => {
    setSaveHandler(requestSave);
    return () => setSaveHandler(() => undefined);
  }, [requestSave, setSaveHandler]);

  useEffect(() => {
    if (!hasCheckedSavedCanvas.current) return;

    setSaveStatus("saving");
    const timeout = window.setTimeout(requestSave, 800);

    return () => window.clearTimeout(timeout);
  }, [edges, nodes, requestSave, setSaveStatus]);
}
