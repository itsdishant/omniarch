"use client";

import { useRef, useState, type ReactNode } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { EditorWorkspacePane } from "@/components/editor/editor-workspace-pane";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectDialogsProvider } from "@/components/editor/project-dialogs-provider";

interface EditorShellProps {
  children?: ReactNode;
}

export function EditorShell({ children }: EditorShellProps) {
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
        >
          {children}
        </EditorWorkspacePane>
      </div>
      <ProjectDialogs />
    </ProjectDialogsProvider>
  );
}
