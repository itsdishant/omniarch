"use client";

import { UserButton } from "@clerk/nextjs";
import {
  LayoutTemplate,
  PanelLeftClose,
  PanelLeftOpen,
  Save,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { RefObject } from "react";

import { Button } from "@/components/ui/button";
import { useCanvasSaveStatus } from "@/hook/useCanvasAutosave";

interface EditorNavbarProps {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  toggleRef: RefObject<HTMLButtonElement | null>;
  projectName?: string;
  aiSidebarOpen?: boolean;
  onAiSidebarToggle?: () => void;
  onShareClick?: () => void;
  onTemplatesClick?: () => void;
}

export function EditorNavbar({
  sidebarOpen,
  onSidebarToggle,
  toggleRef,
  projectName,
  aiSidebarOpen = false,
  onAiSidebarToggle,
  onShareClick,
  onTemplatesClick,
}: EditorNavbarProps) {
  const showWorkspaceActions = Boolean(projectName);
  const { saveNow, saveStatus } = useCanvasSaveStatus();
  const router = useRouter();
  const canCloseProject = saveStatus !== "saving" && saveStatus !== "error";

  return (
    <header className="relative flex h-14 shrink-0 items-center justify-between gap-3 px-3">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          ref={toggleRef}
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={sidebarOpen}
          onClick={onSidebarToggle}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>
        {showWorkspaceActions ? (
          <div className="min-w-0">
            <h1 className="truncate text-sm font-medium text-copy-primary">
              {projectName}
            </h1>
            <p className="text-[11px] leading-none text-copy-muted">
              Workspace
            </p>
          </div>
        ) : null}
      </div>
      {!showWorkspaceActions ? (
        <h1 className="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-copy-primary">
          OmniArch
        </h1>
      ) : null}
      <div className="flex shrink-0 items-center gap-2">
        {showWorkspaceActions ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              aria-label="Close project"
              title="Close project"
              disabled={!canCloseProject}
              onClick={() => router.push("/editor")}
            >
              <X data-icon="inline-start" className="h-4 w-4" />
              Close
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              aria-label={`Save canvas (${saveStatus})`}
              onClick={saveNow}
            >
              <Save
                className={
                  saveStatus === "saving"
                    ? "text-brand"
                    : saveStatus === "error"
                      ? "text-destructive"
                      : "text-success"
                }
              />
              {saveStatus === "saving"
                ? "Saving..."
                : saveStatus === "saved"
                  ? "Saved"
                  : saveStatus === "error"
                    ? "Error"
                    : "Save"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={onTemplatesClick}
            >
              <LayoutTemplate data-icon="inline-start" className="h-4 w-4" />
              Templates
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={onShareClick}
            >
              <Share2 data-icon="inline-start" className="h-4 w-4" />
              Share
            </Button>
            <Button
              type="button"
              size="sm"
              className="rounded-full"
              aria-label={
                aiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"
              }
              aria-expanded={aiSidebarOpen}
              onClick={onAiSidebarToggle}
            >
              <Sparkles data-icon="inline-start" className="h-4 w-4" />
              AI
            </Button>
          </>
        ) : null}
        <UserButton />
      </div>
    </header>
  );
}
