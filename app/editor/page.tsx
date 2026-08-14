import { auth } from "@clerk/nextjs/server";

import { EditorHome } from "@/components/editor/editor-home";
import { EditorShell } from "@/components/editor/editor-shell";

export default async function EditorPage() {
  await auth.protect();

  return (
    <EditorShell>
      <EditorHome />
    </EditorShell>
  );
}
