"use client";

import { useRef, useState, type ReactNode } from "react";

import { CreateProjectDialog } from "@/components/editor/create-project-dialog";
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogsProvider } from "@/components/editor/project-dialogs-provider";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog";

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
        <div className="relative min-h-0 flex-1">
          {sidebarOpen ? (
            <button
              type="button"
              aria-label="Close sidebar"
              className="absolute inset-0 z-10 bg-base/70 md:hidden"
              onClick={handleSidebarClose}
            />
          ) : null}
          <ProjectSidebar
            isOpen={sidebarOpen}
            onClose={handleSidebarClose}
          />
          {children}
        </div>
      </div>
      <CreateProjectDialog />
      <RenameProjectDialog />
      <DeleteProjectDialog />
    </ProjectDialogsProvider>
  );
}
