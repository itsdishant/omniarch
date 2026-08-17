"use client";

import { UserButton } from "@clerk/nextjs";
import { PanelLeftClose, PanelLeftOpen, Share2, Sparkles } from "lucide-react";
import type { RefObject } from "react";

import { Button } from "@/components/ui/button";

interface EditorNavbarProps {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  toggleRef: RefObject<HTMLButtonElement | null>;
  projectName?: string;
  aiSidebarOpen?: boolean;
  onAiSidebarToggle?: () => void;
  onShareClick?: () => void;
}

export function EditorNavbar({
  sidebarOpen,
  onSidebarToggle,
  toggleRef,
  projectName,
  aiSidebarOpen = false,
  onAiSidebarToggle,
  onShareClick,
}: EditorNavbarProps) {
  const showWorkspaceActions = Boolean(projectName);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 px-3">
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
        <div className="min-w-0">
          <h1 className="truncate text-sm font-medium text-copy-primary">
            {projectName ?? "Omniarch"}
          </h1>
          <p className="text-[11px] leading-none text-copy-muted">Workspace</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {showWorkspaceActions ? (
          <>
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
              aria-label={aiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
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
