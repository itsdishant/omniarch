"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogPattern } from "@/components/editor/dialog-pattern";
import { useProjectDialogsContext } from "@/components/editor/project-dialogs-provider";

export function RenameProjectDialog() {
  const { dialog, targetProject, name, setName, isLoading, close, submit } =
    useProjectDialogsContext();

  return (
    <DialogPattern
      open={dialog === "rename"}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
      title="Rename Project"
      description={
        targetProject
          ? `Current name: ${targetProject.name}`
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
            type="submit"
            form="rename-project-form"
            disabled={isLoading || name.trim().length === 0}
          >
            Rename
          </Button>
        </>
      }
    >
      <form
        id="rename-project-form"
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim().length === 0) {
            return;
          }
          submit();
        }}
      >
        <label className="flex flex-col gap-1.5" htmlFor="rename-project-name">
          <span className="text-sm text-copy-secondary">Project name</span>
          <Input
            id="rename-project-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="off"
            autoFocus
            disabled={isLoading}
            className="text-copy-primary placeholder:text-copy-muted"
          />
        </label>
      </form>
    </DialogPattern>
  );
}
