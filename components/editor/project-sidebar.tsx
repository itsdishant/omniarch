"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectDialogsContext } from "@/components/editor/project-dialogs-provider";
import type { EditorProjectListItem } from "@/lib/projects";
import { cn } from "@/lib/utils";

export type ProjectSidebarTab = "my-projects" | "shared";

function tabForCurrentRoom(
  currentRoomId: string | undefined,
  sharedProjects: EditorProjectListItem[],
): ProjectSidebarTab {
  if (
    currentRoomId &&
    sharedProjects.some((project) => project.id === currentRoomId)
  ) {
    return "shared";
  }

  return "my-projects";
}

interface ProjectSidebarProps {
  currentRoomId?: string;
  isOpen: boolean;
  onClose: () => void;
  ownedProjects: EditorProjectListItem[];
  sharedProjects: EditorProjectListItem[];
}

interface EmptyProjectsPlaceholderProps {
  label: string;
}

function EmptyProjectsPlaceholder({ label }: EmptyProjectsPlaceholderProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-4 py-8 text-center">
      <p className="text-sm text-copy-muted">{label}</p>
    </div>
  );
}

interface ProjectListItemProps {
  currentRoomId?: string;
  project: EditorProjectListItem;
  showActions: boolean;
}

function ProjectListItem({
  currentRoomId,
  project,
  showActions,
}: ProjectListItemProps) {
  const { openRename, openDelete } = useProjectDialogsContext();
  const isCurrentRoom = currentRoomId === project.id;

  return (
    <li className="group px-2 py-0.5">
      <div
        className={cn(
          "flex items-center rounded-xl",
          isCurrentRoom
            ? "bg-accent-dim text-copy-primary"
            : "text-copy-primary hover:bg-subtle",
        )}
      >
        <Link
          href={`/editor/${encodeURIComponent(project.id)}`}
          aria-current={isCurrentRoom ? "page" : undefined}
          className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-sm"
        >
          <span
            className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full",
              isCurrentRoom ? "bg-brand" : "bg-transparent",
            )}
          />
          <span className="truncate">{project.name}</span>
        </Link>
        {showActions ? (
          <div
            className={cn(
              "flex shrink-0 items-center pr-1",
              isCurrentRoom
                ? "opacity-100"
                : "opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="bg-transparent hover:bg-transparent"
              aria-label={`Rename ${project.name}`}
              onClick={() => openRename(project)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="bg-transparent hover:bg-transparent"
              aria-label={`Delete ${project.name}`}
              onClick={() => openDelete(project)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </li>
  );
}

interface ProjectListProps {
  currentRoomId?: string;
  projects: EditorProjectListItem[];
  emptyLabel: string;
  showActions: boolean;
}

function ProjectList({
  currentRoomId,
  projects,
  emptyLabel,
  showActions,
}: ProjectListProps) {
  if (projects.length === 0) {
    return <EmptyProjectsPlaceholder label={emptyLabel} />;
  }

  return (
    <ul className="flex flex-col gap-0.5 py-2">
      {projects.map((project) => (
        <ProjectListItem
          key={project.id}
          currentRoomId={currentRoomId}
          project={project}
          showActions={showActions}
        />
      ))}
    </ul>
  );
}

export function ProjectSidebar({
  currentRoomId,
  isOpen,
  onClose,
  ownedProjects,
  sharedProjects,
}: ProjectSidebarProps) {
  const { openCreate } = useProjectDialogsContext();
  const roomTab = tabForCurrentRoom(currentRoomId, sharedProjects);
  const [tabOverride, setTabOverride] = useState<{
    roomId: string | undefined;
    tab: ProjectSidebarTab;
  } | null>(null);
  const tab =
    tabOverride && tabOverride.roomId === currentRoomId
      ? tabOverride.tab
      : roomTab;

  return (
    <aside
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={cn(
        "pointer-events-none absolute inset-y-3 left-3 z-30 flex w-72 flex-col rounded-2xl border border-surface-border bg-surface/95 shadow-lg backdrop-blur-sm",
        "transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-[calc(100%+1.5rem)]",
      )}
    >
      <div
        className={cn(
          "flex h-full flex-col",
          isOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div className="flex h-12 shrink-0 items-center justify-between px-3">
          <h2 className="text-sm font-medium text-copy-primary">Projects</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close sidebar"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs
          value={tab}
          onValueChange={(value) => {
            if (value === "my-projects" || value === "shared") {
              setTabOverride({ roomId: currentRoomId, tab: value });
            }
          }}
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          <div className="shrink-0 px-3 pb-2">
            <TabsList className="w-full rounded-xl">
              <TabsTrigger value="my-projects" className="rounded-lg">
                My Projects
              </TabsTrigger>
              <TabsTrigger value="shared" className="rounded-lg">
                Shared
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <TabsContent value="my-projects" className="h-full">
              <ProjectList
                currentRoomId={currentRoomId}
                projects={ownedProjects}
                emptyLabel="No projects yet"
                showActions
              />
            </TabsContent>
            <TabsContent value="shared" className="h-full">
              <ProjectList
                currentRoomId={currentRoomId}
                projects={sharedProjects}
                emptyLabel="No shared projects yet"
                showActions={false}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="shrink-0 p-3">
          <Button
            type="button"
            className="h-8 w-full rounded-full"
            onClick={openCreate}
          >
            <Plus data-icon="inline-start" className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>
    </aside>
  );
}
