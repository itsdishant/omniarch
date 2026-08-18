"use client";

import { Link2, Mail, Trash2, UserRound } from "lucide-react";

import { DialogPattern } from "@/components/editor/dialog-pattern";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useShareDialog,
  type ShareCollaborator,
} from "@/hooks/use-share-dialog";
import { cn } from "@/lib/utils";

interface ShareDialogProps {
  open: boolean;
  projectId: string;
  canManage: boolean;
  onOpenChange: (open: boolean) => void;
}

function CollaboratorAvatar({
  collaborator,
}: {
  collaborator: ShareCollaborator;
}) {
  if (collaborator.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={collaborator.imageUrl}
        alt=""
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-subtle">
      <UserRound className="h-4 w-4 text-copy-muted" />
    </div>
  );
}

function RoleBadge({ role }: { role: "owner" | "collaborator" }) {
  const isOwner = role === "owner";

  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide",
        isOwner
          ? "border-brand/50 text-brand"
          : "border-surface-border text-copy-muted",
      )}
    >
      {isOwner ? "OWNER" : "COLLABORATOR"}
    </span>
  );
}

function AccessRow({
  person,
  role,
  canRemove,
  removing,
  onRemove,
}: {
  person: ShareCollaborator;
  role: "owner" | "collaborator";
  canRemove: boolean;
  removing: boolean;
  onRemove?: () => void;
}) {
  const name = person.displayName ?? person.email;

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-surface-border bg-surface px-3 py-2.5">
      <CollaboratorAvatar collaborator={person} />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-medium text-copy-primary">
            {name}
          </p>
          <RoleBadge role={role} />
        </div>
        {person.email ? (
          <p className="truncate text-xs text-copy-muted">{person.email}</p>
        ) : null}
      </div>
      {canRemove && onRemove ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove ${person.email}`}
          disabled={removing}
          className="shrink-0 text-error hover:bg-error/10 hover:text-error"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : null}
    </li>
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
    owner,
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

  const peopleCount = (owner ? 1 : 0) + collaborators.length;

  return (
    <DialogPattern
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          reset();
        }
        onOpenChange(nextOpen);
      }}
      title="Share project"
      description={
        resolvedCanManage
          ? "Invite collaborators, copy the workspace link, and manage access."
          : "People with access to this project."
      }
      className="max-w-xl gap-5 p-6 sm:max-w-xl"
      titleClassName="text-xl font-semibold"
      descriptionClassName="text-[15px] leading-relaxed"
    >
      <div className="flex flex-col gap-3">
        {resolvedCanManage ? (
          <section className="flex items-center justify-between gap-4 rounded-2xl border border-surface-border bg-surface px-4 py-3">
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-copy-primary">
                Workspace link
              </h3>
              <p className="mt-0.5 text-sm leading-snug text-copy-muted">
                Share a direct link with teammates after you grant them access.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-9 shrink-0 rounded-full border-surface-border bg-base px-3 text-copy-primary hover:bg-elevated"
              onClick={() => {
                void copyProjectLink();
              }}
            >
              <Link2 data-icon="inline-start" className="h-4 w-4" />
              {copied ? "Copied!" : "Copy link"}
            </Button>
          </section>
        ) : null}

        {resolvedCanManage ? (
          <form
            className="flex items-center gap-2 rounded-2xl border border-surface-border bg-surface p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void invite();
            }}
          >
            <div className="relative min-w-0 flex-1">
              <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-copy-muted" />
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="teammate@company.com"
                autoComplete="off"
                disabled={isInviting}
                className="h-10 rounded-full bg-base pl-9 text-copy-primary placeholder:text-copy-muted"
              />
            </div>
            <Button
              type="submit"
              disabled={isInviting || email.trim() === ""}
              className="h-10 shrink-0 rounded-full px-5"
            >
              Invite
            </Button>
          </form>
        ) : null}

        {error ? (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        ) : null}

        <section className="rounded-2xl border border-surface-border bg-surface p-3">
          <div className="mb-3 flex items-center justify-between gap-2 px-1">
            <h3 className="text-sm font-medium text-copy-primary">
              People with access
            </h3>
            <p className="text-xs text-copy-muted">{peopleCount} total</p>
          </div>
          {isLoading ? (
            <p className="px-1 text-sm text-copy-muted">Loading…</p>
          ) : peopleCount === 0 ? (
            <p className="px-1 text-sm text-copy-muted">
              No one has access yet.
            </p>
          ) : (
            <ScrollArea className="max-h-64">
              <ul className="flex flex-col gap-2">
                {owner ? (
                  <AccessRow
                    person={owner}
                    role="owner"
                    canRemove={false}
                    removing={false}
                  />
                ) : null}
                {collaborators.map((collaborator) => (
                  <AccessRow
                    key={collaborator.id}
                    person={collaborator}
                    role="collaborator"
                    canRemove={resolvedCanManage}
                    removing={removingId === collaborator.id}
                    onRemove={() => {
                      void remove(collaborator.id);
                    }}
                  />
                ))}
              </ul>
            </ScrollArea>
          )}
        </section>
      </div>
    </DialogPattern>
  );
}
