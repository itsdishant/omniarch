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
    <div className="relative flex min-h-0 flex-1 gap-2 px-2 pb-2">
      {sidebarOpen && isMobile ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="absolute inset-0 z-10 bg-base/70 md:hidden"
          onClick={onSidebarClose}
        />
      ) : null}
      <ProjectSidebar
        currentRoomId={currentRoomId}
        docked={!isMobile}
        isOpen={sidebarOpen}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        onClose={onSidebarClose}
      />
      <div
        className="flex h-full min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden rounded-2xl border border-surface-border bg-base"
        inert={contentObscured}
      >
        {children}
      </div>
      {currentRoomId ? (
        <AiSidebarPlaceholder docked={!isMobile} isOpen={aiSidebarOpen} />
      ) : null}
    </div>
  );
}
