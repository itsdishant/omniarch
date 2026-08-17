"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useProjectDialogsContext } from "@/components/editor/project-dialogs-provider";

export function EditorHome() {
  const { openCreate } = useProjectDialogsContext();

  return (
    <div className="canvas-dots flex h-full w-full flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-xl font-medium text-copy-primary">
        Create a project or open an existing one
      </h1>
      <p className="max-w-md text-sm text-copy-muted">
        Start a new architecture workspace, or choose a project from the sidebar.
      </p>
      <Button type="button" className="rounded-full" onClick={openCreate}>
        <Plus data-icon="inline-start" className="h-5 w-5" />
        New Project
      </Button>
    </div>
  );
}
