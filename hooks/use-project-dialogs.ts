"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { MockProject } from "@/lib/mock-projects";

export type ProjectDialogKind = "create" | "rename" | "delete";

export interface ProjectDialogsState {
  dialog: ProjectDialogKind | null;
  targetProject: MockProject | null;
  name: string;
  slug: string;
  isNameValid: boolean;
  isLoading: boolean;
  setName: (name: string) => void;
  openCreate: () => void;
  openRename: (project: MockProject) => void;
  openDelete: (project: MockProject) => void;
  close: () => void;
  confirmActiveDialog: () => void;
}

function slugifyProjectName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function useProjectDialogs(): ProjectDialogsState {
  const [dialog, setDialog] = useState<ProjectDialogKind | null>(null);
  const [targetProject, setTargetProject] = useState<MockProject | null>(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const confirmFrameRef = useRef<number | null>(null);

  const slug = useMemo(() => slugifyProjectName(name), [name]);
  const isNameValid = slug.length > 0;

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

  const confirmActiveDialog = useCallback(() => {
    if (!isNameValid && dialog !== "delete") {
      return;
    }

    setIsLoading(true);

    if (confirmFrameRef.current !== null) {
      cancelAnimationFrame(confirmFrameRef.current);
    }

    confirmFrameRef.current = requestAnimationFrame(() => {
      confirmFrameRef.current = null;
      setDialog(null);
      setTargetProject(null);
      setName("");
      setIsLoading(false);
    });
  }, [dialog, isNameValid]);

  useEffect(() => {
    return () => {
      if (confirmFrameRef.current !== null) {
        cancelAnimationFrame(confirmFrameRef.current);
      }
    };
  }, []);

  return {
    dialog,
    targetProject,
    name,
    slug,
    isNameValid,
    isLoading,
    setName,
    openCreate,
    openRename,
    openDelete,
    close,
    confirmActiveDialog,
  };
}
