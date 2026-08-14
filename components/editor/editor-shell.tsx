"use client";

import { useRef, useState, type ReactNode } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { EditorWorkspacePane } from "@/components/editor/editor-workspace-pane";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectDialogsProvider } from "@/components/editor/project-dialogs-provider";
import type { EditorProjectListItem } from "@/lib/projects";

interface EditorShellProps {
  children?: ReactNode;
  ownedProjects: EditorProjectListItem[];
  sharedProjects: EditorProjectListItem[];
}

export function EditorShell({
  children,
  ownedProjects,
  sharedProjects,
}: EditorShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  function handleSidebarClose() {
    setSidebarOpen(false);
    toggleRef.current?.focus();
  }

  return (
    <ProjectDialogsProvider>
      <div className="flex min-h-screen flex-col bg-base">
        <EditorNavbar
          sidebarOpen={sidebarOpen}
          toggleRef={toggleRef}
          onSidebarToggle={() => setSidebarOpen((open) => !open)}
        />
        <EditorWorkspacePane
          sidebarOpen={sidebarOpen}
          onSidebarClose={handleSidebarClose}
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
        >
          {children}
        </EditorWorkspacePane>
      </div>
      <ProjectDialogs />
    </ProjectDialogsProvider>
  );
}
