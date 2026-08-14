"use client";

import type { ReactNode } from "react";

import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { useMobileViewport } from "@/hooks/use-mobile-viewport";

interface EditorWorkspacePaneProps {
  sidebarOpen: boolean;
  onSidebarClose: () => void;
  children?: ReactNode;
}

export function EditorWorkspacePane({
  sidebarOpen,
  onSidebarClose,
  children,
}: EditorWorkspacePaneProps) {
  const isMobile = useMobileViewport();

  return (
    <div className="relative min-h-0 flex-1">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="absolute inset-0 z-10 bg-base/70 md:hidden"
          onClick={onSidebarClose}
        />
      ) : null}
      <ProjectSidebar isOpen={sidebarOpen} onClose={onSidebarClose} />
      <div inert={sidebarOpen && isMobile}>{children}</div>
    </div>
  );
}
