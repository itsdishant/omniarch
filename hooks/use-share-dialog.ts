import { useCallback, useEffect, useRef, useState } from "react";

export interface ShareCollaborator {
  id: string;
  email: string;
  displayName: string | null;
  imageUrl: string | null;
}

interface UseShareDialogOptions {
  open: boolean;
  projectId: string | undefined;
  canManage: boolean;
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

interface ShareCollaboratorsPayload {
  collaborators: ShareCollaborator[];
  canManage: boolean;
}

function readCollaborators(value: unknown): ShareCollaboratorsPayload | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  if (!("collaborators" in value) || !Array.isArray(value.collaborators)) {
    return null;
  }

  if (!("canManage" in value) || typeof value.canManage !== "boolean") {
    return null;
  }

  const collaborators: ShareCollaborator[] = [];

  for (const item of value.collaborators) {
    const collaborator = readCollaborator(item);
    if (!collaborator) {
      return null;
    }
    collaborators.push(collaborator);
  }

  return {
    collaborators,
    canManage: value.canManage,
  };
}

function readCollaborator(value: unknown): ShareCollaborator | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  if (
    !("id" in value) ||
    typeof value.id !== "string" ||
    !("email" in value) ||
    typeof value.email !== "string"
  ) {
    return null;
  }

  const displayName =
    "displayName" in value && typeof value.displayName === "string"
      ? value.displayName
      : null;
  const imageUrl =
    "imageUrl" in value && typeof value.imageUrl === "string"
      ? value.imageUrl
      : null;

  return {
    id: value.id,
    email: value.email,
    displayName,
    imageUrl,
  };
}

function readCreatedCollaborator(value: unknown): ShareCollaborator | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  if (!("collaborator" in value)) {
    return null;
  }

  return readCollaborator(value.collaborator);
}

export function useShareDialog({
  open,
  projectId,
  canManage,
}: UseShareDialogOptions) {
  const [collaborators, setCollaborators] = useState<ShareCollaborator[]>([]);
  const [loadedCanManage, setLoadedCanManage] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef<number | null>(null);
  const resolvedCanManage = loadedCanManage ?? canManage;

  // Track the projectId at the time each mutation starts to prevent
  // cross-project state corruption when requests complete out of order.
  const activeProjectIdRef = useRef<string | undefined>(projectId);

  useEffect(() => {
    activeProjectIdRef.current = projectId;
  }, [projectId]);

  // Clear collaborator state immediately when projectId changes to prevent
  // flashing previous project's data before the fetch effect runs.
  useEffect(() => {
    if (projectId) {
      setCollaborators([]);
      setLoadedCanManage(null);
      setError(null);
    }
  }, [projectId]);

  function clearCopiedTimeout() {
    if (copiedTimeoutRef.current !== null) {
      window.clearTimeout(copiedTimeoutRef.current);
      copiedTimeoutRef.current = null;
    }
  }

  useEffect(() => {
    if (!open || !projectId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setCollaborators([]);
      setLoadedCanManage(null);
      setError(null);

      try {
        const response = await fetch(
          `/api/projects/${encodeURIComponent(projectId)}/collaborators`,
        );

        if (!response.ok) {
          if (!cancelled) {
            setError(await readApiError(response));
          }
          return;
        }

        const payload: unknown = await response.json();
        const nextPayload = readCollaborators(payload);

        if (!cancelled) {
          if (!nextPayload) {
            setError("Something went wrong. Try again.");
            return;
          }

          setCollaborators(nextPayload.collaborators);
          setLoadedCanManage(nextPayload.canManage);
        }
      } catch {
        if (!cancelled) {
          setError("Something went wrong. Try again.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, projectId]);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current !== null) {
        window.clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  const copyProjectLink = useCallback(async () => {
    if (!projectId) {
      return;
    }

    const url = `${window.location.origin}/editor/${encodeURIComponent(projectId)}`;

    try {
      await navigator.clipboard.writeText(url);
      clearCopiedTimeout();
      setCopied(true);
      copiedTimeoutRef.current = window.setTimeout(() => {
        copiedTimeoutRef.current = null;
        setCopied(false);
      }, 2000);
    } catch {
      setError("Could not copy the project link.");
    }
  }, [projectId]);

  const reset = useCallback(() => {
    clearCopiedTimeout();
    setEmail("");
    setError(null);
    setCopied(false);
    setLoadedCanManage(null);
  }, []);

  const invite = useCallback(async () => {
    if (!resolvedCanManage || !projectId || isInviting) {
      return;
    }

    const trimmed = email.trim().toLowerCase();
    if (trimmed === "") {
      return;
    }

    // Capture the projectId at mutation start to verify it hasn't changed on completion.
    const mutationProjectId = projectId;

    setIsInviting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(projectId)}/collaborators`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed }),
        },
      );

      if (!response.ok) {
        if (activeProjectIdRef.current === mutationProjectId) {
          setError(await readApiError(response));
        }
        return;
      }

      const payload: unknown = await response.json();
      const collaborator = readCreatedCollaborator(payload);

      if (!collaborator) {
        if (activeProjectIdRef.current === mutationProjectId) {
          setError("Something went wrong. Try again.");
        }
        return;
      }

      // Only update state if we're still on the same project.
      if (activeProjectIdRef.current === mutationProjectId) {
        setCollaborators((current) => [...current, collaborator]);
        setEmail("");
      }
    } catch {
      if (activeProjectIdRef.current === mutationProjectId) {
        setError("Something went wrong. Try again.");
      }
    } finally {
      // Always clear the loading state to avoid stuck UI, even if project changed.
      // Collaborator list and error updates are still guarded by project identity.
      setIsInviting(false);
    }
  }, [resolvedCanManage, email, isInviting, projectId]);

  const remove = useCallback(
    async (collaboratorId: string) => {
      if (!resolvedCanManage || !projectId || removingId) {
        return;
      }

      // Capture the projectId at mutation start to verify it hasn't changed on completion.
      const mutationProjectId = projectId;

      setRemovingId(collaboratorId);
      setError(null);

      try {
        const response = await fetch(
          `/api/projects/${encodeURIComponent(projectId)}/collaborators/${encodeURIComponent(collaboratorId)}`,
          { method: "DELETE" },
        );

        if (!response.ok) {
          if (activeProjectIdRef.current === mutationProjectId) {
            setError(await readApiError(response));
          }
          return;
        }

        // Only update state if we're still on the same project.
        if (activeProjectIdRef.current === mutationProjectId) {
          setCollaborators((current) =>
            current.filter((collaborator) => collaborator.id !== collaboratorId),
          );
        }
      } catch {
        if (activeProjectIdRef.current === mutationProjectId) {
          setError("Something went wrong. Try again.");
        }
      } finally {
        // Always clear the loading state to avoid stuck UI, even if project changed.
        // Collaborator list and error updates are still guarded by project identity.
        setRemovingId(null);
      }
    },
    [resolvedCanManage, projectId, removingId],
  );

  return {
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
  };
}
