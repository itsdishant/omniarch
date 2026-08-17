"use client";

import { useRef, useState, type ReactNode } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { EditorWorkspacePane } from "@/components/editor/editor-workspace-pane";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectDialogsProvider } from "@/components/editor/project-dialogs-provider";
import { ShareDialog } from "@/components/editor/share-dialog";
import type { EditorProjectListItem } from "@/lib/projects";

interface EditorShellProps {
  canManageShare?: boolean;
  children?: ReactNode;
  currentRoomId?: string;
  ownedProjects: EditorProjectListItem[];
  projectName?: string;
  sharedProjects: EditorProjectListItem[];
}

export function EditorShell({
  canManageShare = false,
  children,
  currentRoomId,
  ownedProjects,
  projectName,
  sharedProjects,
}: EditorShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(() => Boolean(currentRoomId));
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  function handleSidebarClose() {
    setSidebarOpen(false);
    toggleRef.current?.focus();
  }

  return (
    <ProjectDialogsProvider>
      <div className="flex h-svh flex-col bg-base">
        <EditorNavbar
          aiSidebarOpen={aiSidebarOpen}
          projectName={projectName}
          sidebarOpen={sidebarOpen}
          toggleRef={toggleRef}
          onAiSidebarToggle={() => setAiSidebarOpen((open) => !open)}
          onShareClick={() => setShareOpen(true)}
          onSidebarToggle={() => setSidebarOpen((open) => !open)}
        />
        <EditorWorkspacePane
          aiSidebarOpen={aiSidebarOpen}
          currentRoomId={currentRoomId}
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
          sidebarOpen={sidebarOpen}
          onSidebarClose={handleSidebarClose}
        >
          {children}
        </EditorWorkspacePane>
      </div>
      <ProjectDialogs />
      {currentRoomId ? (
        <ShareDialog
          open={shareOpen}
          projectId={currentRoomId}
          canManage={canManageShare}
          onOpenChange={setShareOpen}
        />
      ) : null}
    </ProjectDialogsProvider>
  );
}
