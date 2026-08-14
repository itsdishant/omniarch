"use client";

import { createContext, useContext, type ReactNode } from "react";

import {
  useProjectActions,
  type ProjectActionsState,
} from "@/hooks/use-project-actions";

const ProjectDialogsContext = createContext<ProjectActionsState | null>(null);

interface ProjectDialogsProviderProps {
  children: ReactNode;
}

export function ProjectDialogsProvider({
  children,
}: ProjectDialogsProviderProps) {
  const value = useProjectActions();

  return (
    <ProjectDialogsContext.Provider value={value}>
      {children}
    </ProjectDialogsContext.Provider>
  );
}

export function useProjectDialogsContext(): ProjectActionsState {
  const context = useContext(ProjectDialogsContext);

  if (!context) {
    throw new Error(
      "useProjectDialogsContext must be used within ProjectDialogsProvider",
    );
  }

  return context;
}
