import { useCallback, useEffect, useReducer, useRef, useState } from "react";

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
  owner: ShareCollaborator | null;
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
    owner: "owner" in value ? readCollaborator(value.owner) : null,
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

interface RemoveLock {
  generation: number;
  collaboratorId: string;
}

interface ShareSessionState {
  scopedProjectId: string | undefined;
  collaborators: ShareCollaborator[];
  owner: ShareCollaborator | null;
  loadedCanManage: boolean | null;
  email: string;
  error: string | null;
  isLoading: boolean;
  inviteGeneration: number | null;
  removeLock: RemoveLock | null;
}

type ShareSessionAction =
  | { type: "scope-project"; projectId: string | undefined; open: boolean }
  | { type: "fetch-start" }
  | {
      type: "fetch-success";
      collaborators: ShareCollaborator[];
      canManage: boolean;
      owner: ShareCollaborator | null;
    }
  | { type: "fetch-error"; error: string }
  | { type: "fetch-end" }
  | { type: "invite-start"; generation: number }
  | {
      type: "invite-success";
      generation: number;
      collaborator: ShareCollaborator;
    }
  | { type: "invite-error"; generation: number; error: string }
  | { type: "remove-start"; generation: number; collaboratorId: string }
  | { type: "remove-success"; generation: number; collaboratorId: string }
  | { type: "remove-error"; generation: number; error: string }
  | { type: "set-email"; email: string }
  | { type: "set-error"; error: string }
  | { type: "reset-form" };

function shareSessionReducer(
  state: ShareSessionState,
  action: ShareSessionAction,
): ShareSessionState {
  switch (action.type) {
    case "scope-project":
      return {
        ...state,
        scopedProjectId: action.projectId,
        collaborators: [],
        owner: null,
        loadedCanManage: null,
        email: "",
        error: null,
        isLoading: Boolean(action.open && action.projectId),
        inviteGeneration: null,
        removeLock: null,
      };
    case "fetch-start":
      return {
        ...state,
        isLoading: true,
        collaborators: [],
        owner: null,
        loadedCanManage: null,
        error: null,
      };
    case "fetch-success":
      return {
        ...state,
        isLoading: false,
        collaborators: action.collaborators,
        owner: action.owner,
        loadedCanManage: action.canManage,
      };
    case "fetch-error":
      return {
        ...state,
        isLoading: false,
        error: action.error,
      };
    case "fetch-end":
      return {
        ...state,
        isLoading: false,
      };
    case "invite-start":
      return {
        ...state,
        inviteGeneration: action.generation,
        error: null,
      };
    case "invite-success":
      if (state.inviteGeneration !== action.generation) {
        return state;
      }
      return {
        ...state,
        inviteGeneration: null,
        collaborators: [...state.collaborators, action.collaborator],
        email: "",
      };
    case "invite-error":
      if (state.inviteGeneration !== action.generation) {
        return state;
      }
      return {
        ...state,
        inviteGeneration: null,
        error: action.error,
      };
    case "remove-start":
      return {
        ...state,
        removeLock: {
          generation: action.generation,
          collaboratorId: action.collaboratorId,
        },
        error: null,
      };
    case "remove-success":
      if (state.removeLock?.generation !== action.generation) {
        return state;
      }
      return {
        ...state,
        removeLock: null,
        collaborators: state.collaborators.filter(
          (collaborator) => collaborator.id !== action.collaboratorId,
        ),
      };
    case "remove-error":
      if (state.removeLock?.generation !== action.generation) {
        return state;
      }
      return {
        ...state,
        removeLock: null,
        error: action.error,
      };
    case "set-email":
      return {
        ...state,
        email: action.email,
      };
    case "set-error":
      return {
        ...state,
        error: action.error,
      };
    case "reset-form":
      return {
        ...state,
        email: "",
        error: null,
        loadedCanManage: null,
      };
    default:
      return state;
  }
}

export function useShareDialog({
  open,
  projectId,
  canManage,
}: UseShareDialogOptions) {
  const [state, dispatch] = useReducer(shareSessionReducer, {
    scopedProjectId: projectId,
    collaborators: [],
    owner: null,
    loadedCanManage: null,
    email: "",
    error: null,
    isLoading: false,
    inviteGeneration: null,
    removeLock: null,
  });
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef<number | null>(null);
  const mutationIdRef = useRef(0);
  const resolvedCanManage = state.loadedCanManage ?? canManage;
  const isInviting = state.inviteGeneration !== null;
  const removingId = state.removeLock?.collaboratorId ?? null;

  if (projectId !== state.scopedProjectId) {
    dispatch({ type: "scope-project", projectId, open });
  }

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
      dispatch({ type: "fetch-start" });

      try {
        const response = await fetch(
          `/api/projects/${encodeURIComponent(projectId)}/collaborators`,
        );

        if (!response.ok) {
          if (!cancelled) {
            dispatch({
              type: "fetch-error",
              error: await readApiError(response),
            });
          }
          return;
        }

        const payload: unknown = await response.json();
        const nextPayload = readCollaborators(payload);

        if (!cancelled) {
          if (!nextPayload) {
            dispatch({
              type: "fetch-error",
              error: "Something went wrong. Try again.",
            });
            return;
          }

          dispatch({
            type: "fetch-success",
            collaborators: nextPayload.collaborators,
            canManage: nextPayload.canManage,
            owner: nextPayload.owner,
          });
        }
      } catch {
        if (!cancelled) {
          dispatch({
            type: "fetch-error",
            error: "Something went wrong. Try again.",
          });
        }
      } finally {
        if (!cancelled) {
          dispatch({ type: "fetch-end" });
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
      dispatch({
        type: "set-error",
        error: "Could not copy the project link.",
      });
    }
  }, [projectId]);

  const reset = useCallback(() => {
    clearCopiedTimeout();
    dispatch({ type: "reset-form" });
    setCopied(false);
  }, []);

  const setEmail = useCallback((email: string) => {
    dispatch({ type: "set-email", email });
  }, []);

  const invite = useCallback(async () => {
    if (!resolvedCanManage || !projectId || state.inviteGeneration !== null) {
      return;
    }

    const trimmed = state.email.trim().toLowerCase();
    if (trimmed === "") {
      return;
    }

    const generation = mutationIdRef.current + 1;
    mutationIdRef.current = generation;
    dispatch({ type: "invite-start", generation });

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
        dispatch({
          type: "invite-error",
          generation,
          error: await readApiError(response),
        });
        return;
      }

      const payload: unknown = await response.json();
      const collaborator = readCreatedCollaborator(payload);

      if (!collaborator) {
        dispatch({
          type: "invite-error",
          generation,
          error: "Something went wrong. Try again.",
        });
        return;
      }

      dispatch({ type: "invite-success", generation, collaborator });
    } catch {
      dispatch({
        type: "invite-error",
        generation,
        error: "Something went wrong. Try again.",
      });
    }
  }, [resolvedCanManage, state.email, state.inviteGeneration, projectId]);

  const remove = useCallback(
    async (collaboratorId: string) => {
      if (!resolvedCanManage || !projectId || state.removeLock) {
        return;
      }

      const generation = mutationIdRef.current + 1;
      mutationIdRef.current = generation;
      dispatch({ type: "remove-start", generation, collaboratorId });

      try {
        const response = await fetch(
          `/api/projects/${encodeURIComponent(projectId)}/collaborators/${encodeURIComponent(collaboratorId)}`,
          { method: "DELETE" },
        );

        if (!response.ok) {
          dispatch({
            type: "remove-error",
            generation,
            error: await readApiError(response),
          });
          return;
        }

        dispatch({ type: "remove-success", generation, collaboratorId });
      } catch {
        dispatch({
          type: "remove-error",
          generation,
          error: "Something went wrong. Try again.",
        });
      }
    },
    [resolvedCanManage, projectId, state.removeLock],
  );

  return {
    collaborators: state.collaborators,
    owner: state.owner,
    canManage: resolvedCanManage,
    email: state.email,
    setEmail,
    isLoading: state.isLoading,
    isInviting,
    removingId,
    error: state.error,
    copied,
    copyProjectLink,
    invite,
    remove,
    reset,
  };
}
