"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { isValidProjectName } from "@/lib/project-name";
import type { EditorProjectListItem } from "@/lib/projects";

export type ProjectDialogKind = "create" | "rename" | "delete";

export interface ProjectActionsState {
  dialog: ProjectDialogKind | null;
  targetProject: EditorProjectListItem | null;
  name: string;
  roomId: string;
  isNameValid: boolean;
  isLoading: boolean;
  error: string | null;
  setName: (name: string) => void;
  openCreate: () => void;
  openRename: (project: EditorProjectListItem) => void;
  openDelete: (project: EditorProjectListItem) => void;
  close: () => void;
  confirmActiveDialog: () => void;
}

const FALLBACK_ROOM_SLUG = "project";

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

function roomIdForName(name: string, suffix: string): string {
  if (name.trim() === "" || suffix === "") {
    return "";
  }

  return `${slugifyProjectName(name) || FALLBACK_ROOM_SLUG}-${suffix}`;
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

async function readApiError(response: Response): Promise<string> {
  try {
    const value: unknown = await response.json();

    if (
      value !== null &&
      typeof value === "object" &&
      "error" in value &&
      typeof value.error === "string" &&
      value.error.trim() !== ""
    ) {
      return value.error;
    }
  } catch {
    // Fall through to the generic message.
  }

  return "Something went wrong. Try again.";
}

export function useProjectActions(): ProjectActionsState {
  const router = useRouter();
  const pathname = usePathname();
  const [dialog, setDialog] = useState<ProjectDialogKind | null>(null);
  const [targetProject, setTargetProject] =
    useState<EditorProjectListItem | null>(null);
  const [name, setNameState] = useState("");
  const [suffix, setSuffix] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roomId = useMemo(() => roomIdForName(name, suffix), [name, suffix]);
  const isNameValid = isValidProjectName(name);

  const setName = useCallback((nextName: string) => {
    setError(null);
    setNameState(nextName);
  }, []);

  const close = useCallback(() => {
    if (isLoading) {
      return;
    }

    setDialog(null);
    setTargetProject(null);
    setNameState("");
    setSuffix("");
    setError(null);
  }, [isLoading]);

  const openCreate = useCallback(() => {
    setTargetProject(null);
    setNameState("");
    setSuffix(createShortSuffix());
    setError(null);
    setDialog("create");
  }, []);

  const openRename = useCallback((project: EditorProjectListItem) => {
    setTargetProject(project);
    setNameState(project.name);
    setSuffix("");
    setError(null);
    setDialog("rename");
  }, []);

  const openDelete = useCallback((project: EditorProjectListItem) => {
    setTargetProject(project);
    setError(null);
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
        setError(null);

        try {
          const response = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, id: roomId }),
          });

          if (!response.ok) {
            setError(await readApiError(response));
            return;
          }

          const payload: unknown = await response.json();
          const projectId = readCreatedProjectId(payload);

          if (!projectId) {
            setError("Something went wrong. Try again.");
            return;
          }

          setDialog(null);
          setTargetProject(null);
          setNameState("");
          setSuffix("");
          setError(null);
          router.push(`/editor/${projectId}`);
        } catch {
          setError("Something went wrong. Try again.");
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
        setError(null);

        try {
          const response = await fetch(`/api/projects/${targetProject.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: nextName }),
          });

          if (!response.ok) {
            setError(await readApiError(response));
            return;
          }

          setDialog(null);
          setTargetProject(null);
          setNameState("");
          setError(null);
          router.refresh();
        } catch {
          setError("Something went wrong. Try again.");
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
        setError(null);

        try {
          const response = await fetch(`/api/projects/${deletedProjectId}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            setError(await readApiError(response));
            return;
          }

          setDialog(null);
          setTargetProject(null);
          setNameState("");
          setError(null);

          if (isActiveWorkspace) {
            router.replace("/editor");
            return;
          }

          router.refresh();
        } catch {
          setError("Something went wrong. Try again.");
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
    error,
    setName,
    openCreate,
    openRename,
    openDelete,
    close,
    confirmActiveDialog,
  };
}
