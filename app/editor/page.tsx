import { EditorHome } from "@/components/editor/editor-home";
import { EditorShell } from "@/components/editor/editor-shell";

export default function EditorPage() {
  return (
    <EditorShell>
      <EditorHome />
    </EditorShell>
  );
}
