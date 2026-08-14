"use client";

import { Button } from "@/components/ui/button";
import { DialogPattern } from "@/components/editor/dialog-pattern";
import { useProjectDialogsContext } from "@/components/editor/project-dialogs-provider";

export function DeleteProjectDialog() {
  const { dialog, targetProject, isLoading, close, submit } =
    useProjectDialogsContext();

  return (
    <DialogPattern
      open={dialog === "delete"}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
      title="Delete Project"
      description={
        targetProject
          ? `Delete “${targetProject.name}”? This cannot be undone.`
          : undefined
      }
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={close}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={submit}
            disabled={isLoading}
          >
            Delete
          </Button>
        </>
      }
    />
  );
}
