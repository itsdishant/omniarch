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

export function readOptionalName(body: unknown): string | undefined | Response {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!("name" in body) || body.name === undefined) {
    return undefined;
  }

  if (
    typeof body.name !== "string" ||
    body.name.trim().length > MAX_PROJECT_NAME_LENGTH
  ) {
    return Response.json({ error: "Invalid project name" }, { status: 400 });
  }

  return body.name;
}

export function readOptionalId(body: unknown): string | undefined | Response {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!("id" in body) || body.id === undefined) {
    return undefined;
  }

  if (typeof body.id !== "string" || body.id.trim() === "") {
    return Response.json({ error: "Invalid project id" }, { status: 400 });
  }

  return body.id;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function readRequiredEmail(body: unknown): string | Response {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!("email" in body) || typeof body.email !== "string") {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();

  if (email === "" || !EMAIL_PATTERN.test(email)) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  return email;
}
