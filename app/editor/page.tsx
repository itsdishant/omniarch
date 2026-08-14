import { auth } from "@clerk/nextjs/server";

import { EditorHome } from "@/components/editor/editor-home";
import { EditorShell } from "@/components/editor/editor-shell";
import { listEditorSidebarProjects } from "@/lib/projects";
import { getViewerEmails } from "@/lib/viewer-emails";

export default async function EditorPage() {
  const { userId } = await auth.protect();
  const { ownedProjects, sharedProjects } = await listEditorSidebarProjects(
    userId,
    await getViewerEmails(),
  );

  return (
    <EditorShell
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
    >
      <EditorHome />
    </EditorShell>
  );
}
