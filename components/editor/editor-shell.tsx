"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { EditorWorkspacePane } from "@/components/editor/editor-workspace-pane";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectDialogsProvider } from "@/components/editor/project-dialogs-provider";
import { ShareDialog } from "@/components/editor/share-dialog";
import {
  StarterTemplateProvider,
  useStarterTemplateImport,
} from "@/components/editor/starter-template-context";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import { CanvasSaveStatusProvider } from "@/hook/useCanvasAutosave";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (currentRoomId) {
      // This reset intentionally runs when entering a project room.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSidebarOpen(false);
    }
  }, [currentRoomId]);

  function handleSidebarClose() {
    setSidebarOpen(false);
    toggleRef.current?.focus();
  }

  return (
    <CanvasSaveStatusProvider>
      <ProjectDialogsProvider>
        <StarterTemplateProvider>
        <EditorShellChrome
          aiSidebarOpen={aiSidebarOpen}
          canManageShare={canManageShare}
          currentRoomId={currentRoomId}
          ownedProjects={ownedProjects}
          projectName={projectName}
          shareOpen={shareOpen}
          sharedProjects={sharedProjects}
          sidebarOpen={sidebarOpen}
          templatesOpen={templatesOpen}
          toggleRef={toggleRef}
          onAiSidebarToggle={() => setAiSidebarOpen((open) => !open)}
          onAiSidebarClose={() => setAiSidebarOpen(false)}
          onShareOpenChange={setShareOpen}
          onSidebarClose={handleSidebarClose}
          onSidebarToggle={() => setSidebarOpen((open) => !open)}
          onTemplatesOpenChange={setTemplatesOpen}
        >
          {children}
          </EditorShellChrome>
        </StarterTemplateProvider>
      </ProjectDialogsProvider>
    </CanvasSaveStatusProvider>
  );
}

interface EditorShellChromeProps {
  aiSidebarOpen: boolean;
  canManageShare: boolean;
  children?: ReactNode;
  currentRoomId?: string;
  ownedProjects: EditorProjectListItem[];
  projectName?: string;
  shareOpen: boolean;
  sharedProjects: EditorProjectListItem[];
  sidebarOpen: boolean;
  templatesOpen: boolean;
  toggleRef: RefObject<HTMLButtonElement | null>;
  onAiSidebarToggle: () => void;
  onAiSidebarClose: () => void;
  onShareOpenChange: (open: boolean) => void;
  onSidebarClose: () => void;
  onSidebarToggle: () => void;
  onTemplatesOpenChange: (open: boolean) => void;
}

function EditorShellChrome({
  aiSidebarOpen,
  canManageShare,
  children,
  currentRoomId,
  ownedProjects,
  projectName,
  shareOpen,
  sharedProjects,
  sidebarOpen,
  templatesOpen,
  toggleRef,
  onAiSidebarToggle,
  onAiSidebarClose,
  onShareOpenChange,
  onSidebarClose,
  onSidebarToggle,
  onTemplatesOpenChange,
}: EditorShellChromeProps) {
  const { importTemplate } = useStarterTemplateImport();

  return (
    <>
      <div className="flex h-svh flex-col bg-base">
        <EditorNavbar
          aiSidebarOpen={aiSidebarOpen}
          projectName={projectName}
          sidebarOpen={sidebarOpen}
          toggleRef={toggleRef}
          onAiSidebarToggle={onAiSidebarToggle}
          onShareClick={() => onShareOpenChange(true)}
          onSidebarToggle={onSidebarToggle}
          onTemplatesClick={() => onTemplatesOpenChange(true)}
        />
        <EditorWorkspacePane
          aiSidebarOpen={aiSidebarOpen}
          currentRoomId={currentRoomId}
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
          sidebarOpen={sidebarOpen}
          onSidebarClose={onSidebarClose}
          onAiSidebarClose={onAiSidebarClose}
        >
          {children}
        </EditorWorkspacePane>
      </div>
      <ProjectDialogs />
      {currentRoomId ? (
        <>
          <ShareDialog
            open={shareOpen}
            projectId={currentRoomId}
            canManage={canManageShare}
            onOpenChange={onShareOpenChange}
          />
          <StarterTemplatesModal
            open={templatesOpen}
            onOpenChange={onTemplatesOpenChange}
            onImport={importTemplate}
          />
        </>
      ) : null}
    </>
  );
}
