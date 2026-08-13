"use client";

import { UserButton } from "@clerk/nextjs";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { RefObject } from "react";

import { Button } from "@/components/ui/button";

interface EditorNavbarProps {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  toggleRef: RefObject<HTMLButtonElement | null>;
}

export function EditorNavbar({
  sidebarOpen,
  onSidebarToggle,
  toggleRef,
}: EditorNavbarProps) {
  return (
    <header className="flex h-12 shrink-0 items-center border-b border-surface-border bg-surface">
      <div className="flex h-full w-12 items-center justify-center">
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
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-center" />
      <div className="flex h-full items-center justify-end px-3">
        <UserButton />
      </div>
    </header>
  );
}
