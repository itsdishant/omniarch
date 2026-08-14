import { auth } from "@clerk/nextjs/server";

import {
  parseJsonBody,
  readOptionalId,
  readOptionalName,
} from "@/lib/parse-json-body";
import {
  createOwnedProject,
  listOwnedProjects,
  toEditorProjectListItem,
} from "@/lib/projects";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await listOwnedProjects(userId);
  return Response.json({ projects: projects.map(toEditorProjectListItem) });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseJsonBody(request);
  if (!parsed.ok) {
    return parsed.response;
  }

  const name = readOptionalName(parsed.value);
  if (name instanceof Response) {
    return name;
  }

  const id = readOptionalId(parsed.value);
  if (id instanceof Response) {
    return id;
  }

  const project = await createOwnedProject(userId, { name, id });
  return Response.json({ project }, { status: 201 });
}
