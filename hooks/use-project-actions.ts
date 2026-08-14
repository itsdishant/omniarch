"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import type { EditorProjectListItem } from "@/lib/projects";

export type ProjectDialogKind = "create" | "rename" | "delete";

export interface ProjectActionsState {
  dialog: ProjectDialogKind | null;
  targetProject: EditorProjectListItem | null;
  name: string;
  roomId: string;
  isNameValid: boolean;
  isLoading: boolean;
  setName: (name: string) => void;
  openCreate: () => void;
  openRename: (project: EditorProjectListItem) => void;
  openDelete: (project: EditorProjectListItem) => void;
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

function createShortSuffix(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(-16);
}

function readCreatedProjectId(value: unknown): string | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  if (
    !("project" in value) ||
    value.project === null ||
    typeof value.project !== "object"
  ) {
    return null;
  }

  const project = value.project;
  if (
    !("id" in project) ||
    typeof project.id !== "string" ||
    project.id.trim() === ""
  ) {
    return null;
  }

  return project.id;
}

export function useProjectActions(): ProjectActionsState {
  const router = useRouter();
  const pathname = usePathname();
  const [dialog, setDialog] = useState<ProjectDialogKind | null>(null);
  const [targetProject, setTargetProject] =
    useState<EditorProjectListItem | null>(null);
  const [name, setName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const slug = useMemo(() => slugifyProjectName(name), [name]);
  const roomId = slug && suffix ? `${slug}-${suffix}` : "";
  const isNameValid = slug.length > 0;

  const close = useCallback(() => {
    if (isLoading) {
      return;
    }

    setDialog(null);
    setTargetProject(null);
    setName("");
    setSuffix("");
  }, [isLoading]);

  const openCreate = useCallback(() => {
    setTargetProject(null);
    setName("");
    setSuffix(createShortSuffix());
    setDialog("create");
  }, []);

  const openRename = useCallback((project: EditorProjectListItem) => {
    setTargetProject(project);
    setName(project.name);
    setSuffix("");
    setDialog("rename");
  }, []);

  const openDelete = useCallback((project: EditorProjectListItem) => {
    setTargetProject(project);
    setDialog("delete");
  }, []);

  const confirmActiveDialog = useCallback(() => {
    if (isLoading) {
      return;
    }

    if (dialog === "create") {
      if (!isNameValid || roomId === "") {
        return;
      }

      void (async () => {
        setIsLoading(true);

        try {
          const response = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, id: roomId }),
          });

          if (!response.ok) {
            return;
          }

          const payload: unknown = await response.json();
          const projectId = readCreatedProjectId(payload);

          if (!projectId) {
            return;
          }

          setDialog(null);
          setTargetProject(null);
          setName("");
          setSuffix("");
          router.push(`/editor/${projectId}`);
        } finally {
          setIsLoading(false);
        }
      })();

      return;
    }

    if (dialog === "rename") {
      if (!targetProject || !isNameValid) {
        return;
      }

      const nextName = name.trim();

      void (async () => {
        setIsLoading(true);

        try {
          const response = await fetch(`/api/projects/${targetProject.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: nextName }),
          });

          if (!response.ok) {
            return;
          }

          setDialog(null);
          setTargetProject(null);
          setName("");
          router.refresh();
        } finally {
          setIsLoading(false);
        }
      })();

      return;
    }

    if (dialog === "delete") {
      if (!targetProject) {
        return;
      }

      const deletedProjectId = targetProject.id;
      const isActiveWorkspace = pathname === `/editor/${deletedProjectId}`;

      void (async () => {
        setIsLoading(true);

        try {
          const response = await fetch(`/api/projects/${deletedProjectId}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            return;
          }

          setDialog(null);
          setTargetProject(null);
          setName("");

          if (isActiveWorkspace) {
            router.replace("/editor");
            return;
          }

          router.refresh();
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [
    dialog,
    isLoading,
    isNameValid,
    name,
    pathname,
    roomId,
    router,
    targetProject,
  ]);

  return {
    dialog,
    targetProject,
    name,
    roomId,
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
