import { Compass } from "lucide-react";

export function CanvasPlaceholder() {
  return (
    <div className="canvas-dots flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-surface-border bg-elevated">
        <Compass className="h-6 w-6 text-brand" />
      </div>
      <p className="text-[11px] font-medium tracking-[0.18em] text-copy-muted">
        WORKSPACE SHELL
      </p>
      <h2 className="mt-2 max-w-md text-xl font-medium text-copy-primary">
        Canvas and collaboration tooling land here next.
      </h2>
      <p className="mt-2 max-w-md text-sm text-copy-muted">
        Project context and navigation are wired. The canvas stays empty until
        the next unit.
      </p>
    </div>
  );
}
