import { Lock } from "lucide-react";
import Link from "next/link";

export function AccessDenied() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <Lock className="h-8 w-8 text-copy-muted" />
      <p className="text-sm text-copy-muted">
        You don&apos;t have access to this project.
      </p>
      <Link
        href="/editor"
        className="text-sm text-brand underline-offset-4 hover:underline"
      >
        Back to editor
      </Link>
    </div>
  );
}
