"use client";

import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <aside
      aria-hidden={!isOpen}
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
              <EmptyProjectsPlaceholder label="No projects yet" />
            </TabsContent>
            <TabsContent value="shared" className="h-full">
              <EmptyProjectsPlaceholder label="No shared projects yet" />
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="shrink-0 border-t border-surface-border p-3">
          <Button type="button" className="w-full">
            <Plus data-icon="inline-start" className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>
    </aside>
  );
}
