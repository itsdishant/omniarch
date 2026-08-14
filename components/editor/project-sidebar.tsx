"use client";

import { Pencil, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectDialogsContext } from "@/components/editor/project-dialogs-provider";
import {
  MOCK_OWNED_PROJECTS,
  MOCK_SHARED_PROJECTS,
  type MockProject,
} from "@/lib/mock-projects";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function EmptyProjectsPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-4 py-8 text-center">
      <p className="text-sm text-copy-muted">{label}</p>
    </div>
  );
}

function ProjectListItem({
  project,
  showActions,
}: {
  project: MockProject;
  showActions: boolean;
}) {
  const { openRename, openDelete } = useProjectDialogsContext();

  return (
    <li className="flex items-center gap-1 px-2 py-1">
      <span className="min-w-0 flex-1 truncate px-1 text-sm text-copy-primary">
        {project.name}
      </span>
      {showActions ? (
        <div className="flex shrink-0 items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Rename ${project.name}`}
            onClick={() => openRename(project)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${project.name}`}
            onClick={() => openDelete(project)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </li>
  );
}

function ProjectList({
  projects,
  emptyLabel,
  showActions,
}: {
  projects: MockProject[];
  emptyLabel: string;
  showActions: boolean;
}) {
  if (projects.length === 0) {
    return <EmptyProjectsPlaceholder label={emptyLabel} />;
  }

  return (
    <ul className="flex flex-col gap-0.5 py-2">
      {projects.map((project) => (
        <ProjectListItem
          key={project.id}
          project={project}
          showActions={showActions}
        />
      ))}
    </ul>
  );
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  const { openCreate } = useProjectDialogsContext();

  return (
    <aside
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={cn(
        "pointer-events-none absolute inset-y-0 left-0 z-20 flex w-72 flex-col border-r border-surface-border bg-surface/95 shadow-lg transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div
        className={cn(
          "flex h-full flex-col",
          isOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-surface-border px-3">
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

        <Tabs defaultValue="my-projects" className="flex min-h-0 flex-1 flex-col gap-0">
          <div className="shrink-0 border-b border-surface-border px-3 py-2">
            <TabsList className="w-full">
              <TabsTrigger value="my-projects">My Projects</TabsTrigger>
              <TabsTrigger value="shared">Shared</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <TabsContent value="my-projects" className="h-full">
              <ProjectList
                projects={MOCK_OWNED_PROJECTS}
                emptyLabel="No projects yet"
                showActions
              />
            </TabsContent>
            <TabsContent value="shared" className="h-full">
              <ProjectList
                projects={MOCK_SHARED_PROJECTS}
                emptyLabel="No shared projects yet"
                showActions={false}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="shrink-0 border-t border-surface-border p-3">
          <Button type="button" className="w-full" onClick={openCreate}>
            <Plus data-icon="inline-start" className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>
    </aside>
  );
}
