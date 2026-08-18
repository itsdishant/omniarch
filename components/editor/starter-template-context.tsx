"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import type { CanvasTemplate } from "@/components/editor/starter-templates";

type ImportHandler = (template: CanvasTemplate) => void;

interface StarterTemplateContextValue {
  importTemplate: ImportHandler;
  registerImporter: (handler: ImportHandler | null) => void;
}

const StarterTemplateContext =
  createContext<StarterTemplateContextValue | null>(null);

export function StarterTemplateProvider({ children }: { children: ReactNode }) {
  const importerRef = useRef<ImportHandler | null>(null);

  const registerImporter = useCallback((handler: ImportHandler | null) => {
    importerRef.current = handler;
  }, []);

  const importTemplate = useCallback((template: CanvasTemplate) => {
    importerRef.current?.(template);
  }, []);

  const value = useMemo(
    () => ({ importTemplate, registerImporter }),
    [importTemplate, registerImporter],
  );

  return (
    <StarterTemplateContext.Provider value={value}>
      {children}
    </StarterTemplateContext.Provider>
  );
}

export function useStarterTemplateImport() {
  const context = useContext(StarterTemplateContext);
  if (!context) {
    throw new Error(
      "useStarterTemplateImport must be used within StarterTemplateProvider",
    );
  }
  return context;
}
