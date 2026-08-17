"use client";

import { Copy, UserRound, X } from "lucide-react";

import { DialogPattern } from "@/components/editor/dialog-pattern";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useShareDialog,
  type ShareCollaborator,
} from "@/hooks/use-share-dialog";

interface ShareDialogProps {
  open: boolean;
  projectId: string;
  canManage: boolean;
  onOpenChange: (open: boolean) => void;
}

function CollaboratorAvatar({ collaborator }: { collaborator: ShareCollaborator }) {
  if (collaborator.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={collaborator.imageUrl}
        alt=""
        className="h-8 w-8 shrink-0 rounded-xl object-cover"
      />
    );
  }

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-subtle">
      <UserRound className="h-4 w-4 text-copy-muted" />
    </div>
  );
}

export function ShareDialog({
  open,
  projectId,
  canManage,
  onOpenChange,
}: ShareDialogProps) {
  const {
    collaborators,
    canManage: resolvedCanManage,
    email,
    setEmail,
    isLoading,
    isInviting,
    removingId,
    error,
    copied,
    copyProjectLink,
    invite,
    remove,
    reset,
  } = useShareDialog({ open, projectId, canManage });

  return (
    <DialogPattern
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          reset();
        }
        onOpenChange(nextOpen);
      }}
      title="Share"
      description={
        resolvedCanManage
          ? "Invite people by email, or copy the project link."
          : "People with access to this project."
      }
      className="max-w-lg"
    >
      <div className="flex flex-col gap-4">
        {resolvedCanManage ? (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              void copyProjectLink();
            }}
          >
            <Copy data-icon="inline-start" className="h-5 w-5" />
            {copied ? "Copied!" : "Copy link"}
          </Button>
        ) : null}

        {resolvedCanManage ? (
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void invite();
            }}
          >
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              autoComplete="off"
              disabled={isInviting}
              className="text-copy-primary placeholder:text-copy-muted"
            />
            <Button type="submit" disabled={isInviting || email.trim() === ""}>
              Invite
            </Button>
          </form>
        ) : null}

        {error ? (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-2">
          <p className="text-sm text-copy-secondary">Collaborators</p>
          {isLoading ? (
            <p className="text-sm text-copy-muted">Loading…</p>
          ) : collaborators.length === 0 ? (
            <p className="text-sm text-copy-muted">No collaborators yet.</p>
          ) : (
            <ScrollArea className="max-h-56">
              <ul className="flex flex-col gap-1">
                {collaborators.map((collaborator) => (
                  <li
                    key={collaborator.id}
                    className="flex items-center gap-2 rounded-xl px-1 py-1"
                  >
                    <CollaboratorAvatar collaborator={collaborator} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-copy-primary">
                        {collaborator.displayName ?? collaborator.email}
                      </p>
                      {collaborator.displayName ? (
                        <p className="truncate text-xs text-copy-muted">
                          {collaborator.email}
                        </p>
                      ) : null}
                    </div>
                    {resolvedCanManage ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove ${collaborator.email}`}
                        disabled={removingId === collaborator.id}
                        onClick={() => {
                          void remove(collaborator.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </div>
      </div>
    </DialogPattern>
  );
}
