import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AccessDenied } from "@/components/editor/access-denied";
import { CanvasWrapper } from "@/components/editor/canvas-wrapper";
import { EditorShell } from "@/components/editor/editor-shell";
import {
  findAccessibleProjectForViewer,
  getCurrentClerkIdentity,
} from "@/lib/project-access";
import { listEditorSidebarProjects } from "@/lib/projects";
import { getViewerEmails } from "@/lib/viewer-emails";

export default async function EditorWorkspacePage({
  params,
}: PageProps<"/editor/[roomId]">) {
  await auth.protect();

  const identity = await getCurrentClerkIdentity();

  if (!identity) {
    redirect("/sign-in");
  }

  const { roomId } = await params;
  const project = await findAccessibleProjectForViewer(roomId, identity);

  if (!project) {
    return <AccessDenied />;
  }

  const { ownedProjects, sharedProjects } = await listEditorSidebarProjects(
    identity.userId,
    await getViewerEmails(),
  );

  return (
    <EditorShell
      canManageShare={project.ownerId === identity.userId}
      currentRoomId={project.id}
      ownedProjects={ownedProjects}
      projectName={project.name}
      sharedProjects={sharedProjects}
    >
      <CanvasWrapper roomId={project.id} />
    </EditorShell>
  );
}
