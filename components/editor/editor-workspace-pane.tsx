"use client";

import type { ReactNode } from "react";

import { AiSidebarPlaceholder } from "@/components/editor/ai-sidebar-placeholder";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { useMobileViewport } from "@/hooks/use-mobile-viewport";
import type { EditorProjectListItem } from "@/lib/projects";

interface EditorWorkspacePaneProps {
  aiSidebarOpen: boolean;
  currentRoomId?: string;
  sidebarOpen: boolean;
  onSidebarClose: () => void;
  ownedProjects: EditorProjectListItem[];
  sharedProjects: EditorProjectListItem[];
  children?: ReactNode;
}

export function EditorWorkspacePane({
  aiSidebarOpen,
  currentRoomId,
  sidebarOpen,
  onSidebarClose,
  ownedProjects,
  sharedProjects,
  children,
}: EditorWorkspacePaneProps) {
  const isMobile = useMobileViewport();
  const contentObscured = isMobile && (sidebarOpen || aiSidebarOpen);

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden bg-base">
      {sidebarOpen && isMobile ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="absolute inset-0 z-25 bg-base/70 md:hidden"
          onClick={onSidebarClose}
        />
      ) : null}
      <div
        className={`absolute inset-0 flex min-h-0 w-full flex-col bg-base ${contentObscured ? 'pointer-events-none' : ''}`}
        inert={contentObscured}
        aria-hidden={contentObscured}
      >
        {children}
      </div>
      <ProjectSidebar
        currentRoomId={currentRoomId}
        isOpen={sidebarOpen}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        onClose={onSidebarClose}
      />
      {currentRoomId ? (
        <AiSidebarPlaceholder isOpen={aiSidebarOpen} />
      ) : null}
    </div>
  );
}
