import { Bot, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

interface AiSidebarPlaceholderProps {
  isOpen: boolean;
}

export function AiSidebarPlaceholder({ isOpen }: AiSidebarPlaceholderProps) {
  return (
    <aside
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={cn(
        "pointer-events-none absolute inset-y-3 right-3 z-30 flex w-80 flex-col rounded-2xl border border-surface-border bg-surface/95 shadow-lg backdrop-blur-sm",
        "transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0" : "translate-x-[calc(100%+1.5rem)]",
      )}
    >
      <div
        className={cn(
          "flex h-full flex-col",
          isOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div className="flex shrink-0 items-start justify-between px-4 py-3">
          <div>
            <h2 className="text-sm font-medium text-copy-primary">AI Copilot</h2>
            <p className="text-xs text-copy-muted">Placeholder panel.</p>
          </div>
          <Sparkles className="h-4 w-4 text-ai-text" />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 px-3 pb-3">
          <div className="flex flex-1 flex-col rounded-2xl border border-surface-border bg-elevated p-4">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-subtle">
              <Bot className="h-4 w-4 text-copy-muted" />
            </div>
            <p className="text-sm font-medium text-copy-primary">
              Chat surface pending
            </p>
            <p className="mt-1 text-sm text-copy-muted">
              Prompts and architecture guidance will appear here.
            </p>
          </div>

          <div className="rounded-2xl border border-surface-border bg-elevated px-4 py-3">
            <p className="text-[11px] font-medium tracking-[0.14em] text-copy-muted">
              FUTURE HOOKS
            </p>
            <p className="mt-1 text-xs text-copy-muted">
              Prompt composer and spec generation stay off until later units.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
