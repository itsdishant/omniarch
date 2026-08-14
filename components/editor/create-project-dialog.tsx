"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogPattern } from "@/components/editor/dialog-pattern";
import { useProjectDialogsContext } from "@/components/editor/project-dialogs-provider";

export function CreateProjectDialog() {
  const { dialog, name, setName, slug, isLoading, close, submit } =
    useProjectDialogsContext();

  return (
    <DialogPattern
      open={dialog === "create"}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
      title="Create Project"
      description="Choose a name. The slug updates as you type."
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
            form="create-project-form"
            disabled={isLoading || name.trim().length === 0}
          >
            Create
          </Button>
        </>
      }
    >
      <form
        id="create-project-form"
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim().length === 0) {
            return;
          }
          submit();
        }}
      >
        <label className="flex flex-col gap-1.5" htmlFor="create-project-name">
          <span className="text-sm text-copy-secondary">Project name</span>
          <Input
            id="create-project-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Payments Platform"
            autoComplete="off"
            disabled={isLoading}
            className="text-copy-primary placeholder:text-copy-muted"
          />
        </label>
        <p className="text-sm text-copy-muted">
          Slug: <span className="font-mono text-copy-secondary">{slug}</span>
        </p>
      </form>
    </DialogPattern>
  );
}
