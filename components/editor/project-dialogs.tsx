"use client";

import type { ReactNode } from "react";

import { DialogPattern } from "@/components/editor/dialog-pattern";
import { useProjectDialogsContext } from "@/components/editor/project-dialogs-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProjectActionsState } from "@/hooks/use-project-actions";
import { MAX_PROJECT_NAME_LENGTH } from "@/lib/project-name";

interface DialogFooterActionsProps {
  isLoading: boolean;
  confirmLabel: string;
  confirmFormId?: string;
  confirmVariant?: "default" | "destructive";
  confirmDisabled?: boolean;
  onCancel: () => void;
  onConfirm?: () => void;
}

function DialogFooterActions({
  isLoading,
  confirmLabel,
  confirmFormId,
  confirmVariant = "default",
  confirmDisabled = false,
  onCancel,
  onConfirm,
}: DialogFooterActionsProps) {
  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button
        type={confirmFormId ? "submit" : "button"}
        form={confirmFormId}
        variant={confirmVariant}
        onClick={onConfirm}
        disabled={isLoading || confirmDisabled}
      >
        {confirmLabel}
      </Button>
    </>
  );
}

interface ProjectNameDialogProps {
  open: boolean;
  title: string;
  description?: string;
  formId: string;
  inputId: string;
  confirmLabel: string;
  name: string;
  slugPreview?: string;
  slugPreviewLabel?: string;
  autoFocus?: boolean;
  placeholder?: string;
  isLoading: boolean;
  isNameValid: boolean;
  error?: string | null;
  onNameChange: (name: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

function ProjectNameDialog({
  open,
  title,
  description,
  formId,
  inputId,
  confirmLabel,
  name,
  slugPreview,
  slugPreviewLabel = "Room ID",
  autoFocus = false,
  placeholder,
  isLoading,
  isNameValid,
  error = null,
  onNameChange,
  onClose,
  onConfirm,
}: ProjectNameDialogProps) {
  const nameIsTooLong = name.length > MAX_PROJECT_NAME_LENGTH;

  return (
    <DialogPattern
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
      title={title}
      description={description}
      footer={
        <DialogFooterActions
          isLoading={isLoading}
          confirmLabel={confirmLabel}
          confirmFormId={formId}
          confirmDisabled={!isNameValid}
          onCancel={onClose}
        />
      }
    >
      <form
        id={formId}
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!isNameValid) {
            return;
          }
          onConfirm();
        }}
      >
        <label className="flex flex-col gap-1.5" htmlFor={inputId}>
          <span className="text-sm text-copy-secondary">Project name</span>
          <Input
            id={inputId}
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            autoFocus={autoFocus}
            disabled={isLoading}
            aria-invalid={nameIsTooLong || Boolean(error)}
            aria-describedby={
              nameIsTooLong
                ? `${inputId}-length-error`
                : error
                  ? `${inputId}-request-error`
                  : undefined
            }
            className="text-copy-primary placeholder:text-copy-muted"
          />
        </label>
        {nameIsTooLong ? (
          <p id={`${inputId}-length-error`} className="text-sm text-error">
            Name must be {MAX_PROJECT_NAME_LENGTH} characters or fewer.
          </p>
        ) : null}
        {error ? (
          <p id={`${inputId}-request-error`} className="text-sm text-error">
            {error}
          </p>
        ) : null}
        {slugPreview !== undefined ? (
          <p className="text-sm text-copy-muted">
            {slugPreviewLabel}:{" "}
            <span className="font-mono text-copy-secondary">{slugPreview}</span>
          </p>
        ) : null}
      </form>
    </DialogPattern>
  );
}

function renderActiveDialog(state: ProjectActionsState): ReactNode {
  const {
    dialog,
    targetProject,
    name,
    roomId,
    isNameValid,
    isLoading,
    error,
    setName,
    close,
    confirmActiveDialog,
  } = state;

  switch (dialog) {
    case "create":
      return (
        <ProjectNameDialog
          open
          title="Create Project"
          description="Choose a name. The room ID updates as you type."
          formId="create-project-form"
          inputId="create-project-name"
          confirmLabel="Create"
          name={name}
          slugPreview={roomId}
          placeholder="Payments Platform"
          isLoading={isLoading}
          isNameValid={isNameValid}
          error={error}
          onNameChange={setName}
          onClose={close}
          onConfirm={confirmActiveDialog}
        />
      );
    case "rename":
      return (
        <ProjectNameDialog
          open
          title="Rename Project"
          description={
            targetProject ? `Current name: ${targetProject.name}` : undefined
          }
          formId="rename-project-form"
          inputId="rename-project-name"
          confirmLabel="Rename"
          name={name}
          autoFocus
          isLoading={isLoading}
          isNameValid={isNameValid}
          error={error}
          onNameChange={setName}
          onClose={close}
          onConfirm={confirmActiveDialog}
        />
      );
    case "delete":
      return (
        <DialogPattern
          open
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
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
            <DialogFooterActions
              isLoading={isLoading}
              confirmLabel="Delete"
              confirmVariant="destructive"
              onCancel={close}
              onConfirm={confirmActiveDialog}
            />
          }
        >
          {error ? <p className="text-sm text-error">{error}</p> : null}
        </DialogPattern>
      );
    default:
      return null;
  }
}

export function ProjectDialogs() {
  const state = useProjectDialogsContext();
  return renderActiveDialog(state);
}
