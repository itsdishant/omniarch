"use client";

import { useCallback, useMemo, useState } from "react";

import type { MockProject } from "@/lib/mock-projects";

export type ProjectDialog = "create" | "rename" | "delete" | null;

export function slugifyProjectName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function useProjectDialogs() {
  const [dialog, setDialog] = useState<ProjectDialog>(null);
  const [targetProject, setTargetProject] = useState<MockProject | null>(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const slug = useMemo(() => slugifyProjectName(name), [name]);

  const close = useCallback(() => {
    if (isLoading) {
      return;
    }

    setDialog(null);
    setTargetProject(null);
    setName("");
  }, [isLoading]);

  const openCreate = useCallback(() => {
    setTargetProject(null);
    setName("");
    setDialog("create");
  }, []);

  const openRename = useCallback((project: MockProject) => {
    setTargetProject(project);
    setName(project.name);
    setDialog("rename");
  }, []);

  const openDelete = useCallback((project: MockProject) => {
    setTargetProject(project);
    setDialog("delete");
  }, []);

  const submit = useCallback(() => {
    setIsLoading(true);
    setIsLoading(false);
    setDialog(null);
    setTargetProject(null);
    setName("");
  }, []);

  return {
    dialog,
    targetProject,
    name,
    setName,
    slug,
    isLoading,
    openCreate,
    openRename,
    openDelete,
    close,
    submit,
  };
}
