import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { EditorShell } from "@/components/editor/editor-shell";
import {
  findAccessibleProject,
  listEditorSidebarProjects,
} from "@/lib/projects";
import { getViewerEmails } from "@/lib/viewer-emails";

export default async function ProjectWorkspacePage({
  params,
}: PageProps<"/editor/[projectId]">) {
  const { userId } = await auth.protect();
  const { projectId } = await params;
  const emails = await getViewerEmails();
  const project = await findAccessibleProject(projectId, userId, emails);

  if (!project) {
    notFound();
  }

  const { ownedProjects, sharedProjects } = await listEditorSidebarProjects(
    userId,
    emails,
  );

  return (
    <EditorShell ownedProjects={ownedProjects} sharedProjects={sharedProjects}>
      <div className="h-full min-h-[calc(100vh-3rem)] bg-base" />
    </EditorShell>
  );
}
