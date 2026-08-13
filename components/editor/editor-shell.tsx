"use client";

import { useRef, useState, type ReactNode } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";

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
    <div className="flex min-h-screen flex-col bg-base">
      <EditorNavbar
        sidebarOpen={sidebarOpen}
        toggleRef={toggleRef}
        onSidebarToggle={() => setSidebarOpen((open) => !open)}
      />
      <div className="relative min-h-0 flex-1">
        <ProjectSidebar
          isOpen={sidebarOpen}
          onClose={handleSidebarClose}
        />
        {children}
      </div>
    </div>
  );
}
