"use client";

import { createContext, useContext, type ReactNode } from "react";

import {
  useProjectDialogs,
  type ProjectDialogsState,
} from "@/hooks/use-project-dialogs";

const ProjectDialogsContext = createContext<ProjectDialogsState | null>(null);

interface ProjectDialogsProviderProps {
  children: ReactNode;
}

export function ProjectDialogsProvider({
  children,
}: ProjectDialogsProviderProps) {
  const value = useProjectDialogs();

  return (
    <ProjectDialogsContext.Provider value={value}>
      {children}
    </ProjectDialogsContext.Provider>
  );
}

export function useProjectDialogsContext(): ProjectDialogsState {
  const context = useContext(ProjectDialogsContext);

  if (!context) {
    throw new Error(
      "useProjectDialogsContext must be used within ProjectDialogsProvider",
    );
  }

  return context;
}
