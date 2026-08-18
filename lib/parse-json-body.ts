import { MAX_PROJECT_NAME_LENGTH } from "@/lib/project-name";

export async function parseJsonBody(
  request: Request,
): Promise<{ ok: true; value: unknown } | { ok: false; response: Response }> {
  const text = await request.text();

  if (text.trim() === "") {
    return { ok: true, value: {} };
  }

  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return {
      ok: false,
      response: Response.json({ error: "Invalid JSON" }, { status: 400 }),
    };
  }
}

export function ensureObject(
  body: unknown,
): Record<string, unknown> | Response {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  return body as Record<string, unknown>;
}

export function readOptionalName(body: unknown): string | undefined | Response {
  const maybeObj = ensureObject(body);
  if (maybeObj instanceof Response) return maybeObj;
  const obj = maybeObj;

  if (!("name" in obj) || obj.name === undefined) {
    return undefined;
  }

  if (
    typeof obj.name !== "string" ||
    obj.name.trim().length > MAX_PROJECT_NAME_LENGTH
  ) {
    return Response.json({ error: "Invalid project name" }, { status: 400 });
  }

  return obj.name;
}

export function readOptionalId(body: unknown): string | undefined | Response {
  const maybeObj = ensureObject(body);
  if (maybeObj instanceof Response) return maybeObj;
  const obj = maybeObj;

  if (!("id" in obj) || obj.id === undefined) {
    return undefined;
  }

  if (typeof obj.id !== "string" || obj.id.trim() === "") {
    return Response.json({ error: "Invalid project id" }, { status: 400 });
  }

  return obj.id;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function readRequiredRoom(body: unknown): string | Response {
  const maybeObj = ensureObject(body);
  if (maybeObj instanceof Response) return maybeObj;
  const obj = maybeObj;

  if (!("room" in obj) || typeof obj.room !== "string") {
    return Response.json({ error: "Room ID is required" }, { status: 400 });
  }

  const room = obj.room.trim();

  if (room === "") {
    return Response.json({ error: "Room ID is required" }, { status: 400 });
  }

  return room;
}

export function readRequiredEmail(body: unknown): string | Response {
  const maybeObj = ensureObject(body);
  if (maybeObj instanceof Response) return maybeObj;
  const obj = maybeObj;

  if (!("email" in obj) || typeof obj.email !== "string") {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  const email = obj.email.trim().toLowerCase();

  if (email === "" || !EMAIL_PATTERN.test(email)) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  return email;
}
