"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useProjectDialogs } from "@/hooks/use-project-dialogs";

type ProjectDialogsContextValue = ReturnType<typeof useProjectDialogs>;

const ProjectDialogsContext = createContext<ProjectDialogsContextValue | null>(
  null,
);

export function ProjectDialogsProvider({ children }: { children: ReactNode }) {
  const value = useProjectDialogs();

  return (
    <ProjectDialogsContext.Provider value={value}>
      {children}
    </ProjectDialogsContext.Provider>
  );
}

export function useProjectDialogsContext() {
  const context = useContext(ProjectDialogsContext);

  if (!context) {
    throw new Error(
      "useProjectDialogsContext must be used within ProjectDialogsProvider",
    );
  }

  return context;
}
