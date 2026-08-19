"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ComponentProps,
  type KeyboardEvent,
} from "react";
import { ClientSideSuspense, useRoom } from "@liveblocks/react/suspense";
import { Bot, Download, FileText, Loader2, Plus, Send, X } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAiChat, type AiChatFeedItem } from "@/hooks/use-ai-chat";
import { useDesignAgentRun } from "@/hooks/use-design-agent-run";
import { useSpecGenerationRun } from "@/hooks/use-spec-generation-run";
import { useAiStatus } from "@/hooks/use-ai-status";
import { NODE_COLORS } from "@/types/canvas";
import type { ChatMessage } from "@/types/spec";
import { cn } from "@/lib/utils";

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const chatGreen = NODE_COLORS[6];

const starterPrompts = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
];

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  return (
    <ErrorBoundary
      fallback={<AiSidebarView isOpen={isOpen} onClose={onClose} />}
    >
      <ClientSideSuspense
        fallback={<AiSidebarView isOpen={isOpen} onClose={onClose} />}
      >
        <AiSidebarLive isOpen={isOpen} onClose={onClose} />
      </ClientSideSuspense>
    </ErrorBoundary>
  );
}

function AiSidebarLive({ isOpen, onClose }: AiSidebarProps) {
  const { isGenerating, statusText } = useAiStatus();

  return (
    <AiSidebarView
      isOpen={isOpen}
      onClose={onClose}
      isGenerating={isGenerating}
      statusText={statusText}
    />
  );
}

function AiSidebarView({
  isOpen,
  onClose,
  isGenerating = false,
  statusText,
}: AiSidebarProps & { isGenerating?: boolean; statusText?: string }) {
  return (
    <aside
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={cn(
        "pointer-events-none absolute inset-y-3 right-3 z-30 flex w-80 flex-col rounded-2xl border border-surface-border bg-base/95 shadow-lg backdrop-blur-sm",
        "transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0" : "translate-x-[calc(100%+1.5rem)]",
      )}
    >
      <div
        className={cn(
          "flex h-full min-h-0 flex-col",
          isOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-surface-border px-4 py-3">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-accent-dim text-brand">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-copy-primary">
                AI Workspace
              </h2>
              <p className="text-xs text-copy-muted">
                Collaborate with OmniArch
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close AI sidebar"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="architect" className="min-h-0 flex-1">
          <TabsList className="mx-3 mt-3 grid w-[calc(100%-1.5rem)] grid-cols-2 bg-subtle">
            <TabsTrigger
              value="architect"
              className="text-copy-muted data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="text-copy-muted data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Specs
            </TabsTrigger>
          </TabsList>
          <TabsContent value="architect" className="min-h-0">
            <ArchitectTab isGenerating={isGenerating} statusText={statusText} />
          </TabsContent>
          <TabsContent value="specs" className="min-h-0">
            <SpecsTab statusText={statusText} />
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  );
}

function ArchitectTab({
  isGenerating,
  statusText,
}: {
  isGenerating: boolean;
  statusText?: string;
}) {
  return (
    <ErrorBoundary
      fallback={
        <ArchitectChatPanel
          isGenerating={isGenerating}
          statusText={statusText}
        />
      }
    >
      <ClientSideSuspense
        fallback={
          <ArchitectChatPanel
            isGenerating={isGenerating}
            statusText={statusText}
          />
        }
      >
        <ArchitectChatLive
          isGenerating={isGenerating}
          statusText={statusText}
        />
      </ClientSideSuspense>
    </ErrorBoundary>
  );
}

function ArchitectChatLive({
  isGenerating,
  statusText,
}: {
  isGenerating: boolean;
  statusText?: string;
}) {
  const { messages, sendMessage } = useAiChat();
  const sendAssistant = (content: string) =>
    sendMessage(content, { role: "assistant", sender: "OmniArch" });
  const { isRunActive, startRun } = useDesignAgentRun({
    sendAssistantMessage: sendAssistant,
  });

  return (
    <ArchitectChatPanel
      isGenerating={isGenerating || isRunActive}
      isRunActive={isRunActive}
      statusText={statusText}
      messages={messages}
      sendMessage={sendMessage}
      startRun={startRun}
    />
  );
}

function formatChatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function ArchitectChatPanel({
  isGenerating,
  isRunActive = false,
  statusText,
  messages = [],
  sendMessage,
  startRun,
}: {
  isGenerating: boolean;
  isRunActive?: boolean;
  statusText?: string;
  messages?: AiChatFeedItem[];
  sendMessage?: (
    content: string,
    options?: { role?: "user" | "assistant"; sender?: string },
  ) => Promise<boolean>;
  startRun?: (prompt: string) => Promise<string>;
}) {
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [draft]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, [messages]);

  async function postError(message: string) {
    if (!sendMessage) return;
    await sendMessage(message, { role: "assistant", sender: "OmniArch" });
  }

  async function submit() {
    const content = draft.trim();
    if (!content || isGenerating || isSending || !sendMessage) return;
    setIsSending(true);
    try {
      const sent = await sendMessage(content);
      if (!sent) {
        await postError("Couldn't send message. Try again.");
        return;
      }
      setDraft("");
      if (startRun) {
        await startRun(content);
      }
    } catch (error) {
      await postError(
        error instanceof Error
          ? error.message
          : "Couldn't start design generation",
      );
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      void submit();
    }
  }

  const inputDisabled = isGenerating || isSending || !sendMessage;
  const showStatusStrip = isRunActive || isGenerating;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 px-3 pb-3 pt-3">
      <div
        ref={listRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1"
      >
        {messages.length === 0 ? (
          <div className="flex min-h-full flex-col items-center justify-center px-3 py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-subtle text-brand">
              <Bot className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-medium text-copy-primary">
              Shape your system with AI
            </p>
            <p className="mt-1 max-w-57.5 text-xs leading-5 text-copy-muted">
              Describe what you want to build and OmniArch will help map the
              architecture.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="rounded-full bg-subtle px-2.5 py-1.5 text-left text-[11px] text-accent-foreground transition-colors hover:bg-accent-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  onClick={() => setDraft(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[88%] rounded-xl px-3 py-2 text-sm",
                  message.role === "assistant" &&
                    "border border-surface-border bg-elevated text-copy-primary",
                )}
                style={
                  message.role === "user"
                    ? {
                        backgroundColor: chatGreen.text,
                        color: chatGreen.fill,
                      }
                    : undefined
                }
              >
                <div
                  className={cn(
                    "mb-1 flex items-baseline justify-between gap-2 text-[10px]",
                    message.role === "user" ? "opacity-80" : "text-copy-muted",
                  )}
                >
                  <span className="truncate font-medium">{message.sender}</span>
                  <time dateTime={new Date(message.timestamp).toISOString()}>
                    {formatChatTime(message.timestamp)}
                  </time>
                </div>
                {message.content}
              </div>
            </div>
          ))
        )}
      </div>

      {showStatusStrip ? (
        <div
          className="flex shrink-0 items-center gap-2 rounded-xl border border-surface-border bg-base px-3 py-2"
          aria-live="polite"
        >
          <span
            className="size-1.5 shrink-0 animate-pulse rounded-full"
            style={{ backgroundColor: chatGreen.text }}
            aria-hidden="true"
          />
          <p className="min-w-0 truncate text-[11px] text-copy-secondary">
            {statusText ?? "Working…"}
          </p>
        </div>
      ) : null}

      <div className="shrink-0 rounded-xl border border-surface-border bg-elevated p-2">
        <Textarea
          ref={textareaRef}
          value={draft}
          rows={1}
          placeholder="Describe your architecture..."
          aria-label="Architecture prompt"
          disabled={inputDisabled}
          className="min-h-18 max-h-40 resize-none overflow-y-auto border-0 bg-transparent px-1 py-1 text-sm shadow-none focus-visible:ring-0"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="min-w-0 text-[10px] text-copy-muted">
            Enter to send · Shift+Enter for a new line
          </span>
          <Button
            type="button"
            size="icon-sm"
            aria-label={
              isGenerating
                ? "Generation in progress"
                : isSending
                  ? "Sending message"
                  : "Send prompt"
            }
            disabled={inputDisabled}
            className="text-copy-primary hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: chatGreen.text, color: chatGreen.fill }}
            onClick={() => void submit()}
          >
            {isGenerating || isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SpecsTab({ statusText }: { statusText?: string }) {
  const room = useRoom();
  const { messages: chatMessages } = useAiChat();
  const [specs, setSpecs] = useState<ProjectSpecSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<ProjectSpecSummary | null>(
    null,
  );
  const [content, setContent] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const loadSpecs = useCallback(async () => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${room.id}/specs`, {
        signal: controller.signal,
      });
      const body = (await response.json().catch(() => null)) as {
        specs?: ProjectSpecSummary[];
        error?: string;
      } | null;

      if (!response.ok || !body?.specs) {
        throw new Error(body?.error || "Couldn't load specs");
      }

      setSpecs(body.specs);
    } catch (loadError) {
      if (
        loadError instanceof DOMException &&
        loadError.name === "AbortError"
      ) {
        return;
      }
      setError(
        loadError instanceof Error ? loadError.message : "Couldn't load specs",
      );
      throw loadError;
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [room.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSpecs().catch(() => undefined);
  }, [loadSpecs]);

  const {
    error: generationError,
    isRunActive,
    startRun,
  } = useSpecGenerationRun({
    chatHistory: chatMessages.map<ChatMessage>(
      ({ role, content, timestamp }) => ({ role, content, timestamp }),
    ),
    onComplete: loadSpecs,
  });

  useEffect(() => {
    if (!selectedSpec) {
      return;
    }

    const spec = selectedSpec;
    const controller = new AbortController();

    async function loadPreview() {
      setIsPreviewLoading(true);
      setPreviewError(null);
      try {
        const response = await fetch(
          `/api/projects/${room.id}/specs/${spec.id}/download`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error("Couldn't load spec preview");
        }
        setContent(await response.text());
      } catch (loadError) {
        if (
          loadError instanceof DOMException &&
          loadError.name === "AbortError"
        ) {
          return;
        }
        setPreviewError(
          loadError instanceof Error
            ? loadError.message
            : "Couldn't load spec preview",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsPreviewLoading(false);
        }
      }
    }

    void loadPreview();
    return () => controller.abort();
  }, [room.id, selectedSpec]);

  function closePreview() {
    setSelectedSpec(null);
    setContent(null);
    setPreviewError(null);
  }

  async function generateSpec() {
    try {
      await startRun();
    } catch {
      // The hook exposes the request error in the sidebar.
    }
  }

  return (
    <>
      <div className="flex h-full min-h-0 flex-col px-3 pb-3 pt-3">
        <Button
          type="button"
          className="mb-3 w-full bg-accent text-accent-foreground hover:bg-accent/80"
          disabled={isRunActive}
          onClick={() => void generateSpec()}
        >
          {isRunActive ? (
            <Loader2
              data-icon="inline-start"
              className="h-4 w-4 animate-spin"
            />
          ) : (
            <Plus data-icon="inline-start" className="h-4 w-4" />
          )}
          {isRunActive ? "Generating spec…" : "Generate spec"}
        </Button>
        {isRunActive ? (
          <div
            className="mb-3 flex items-center gap-2 rounded-xl border border-surface-border bg-elevated px-3 py-2"
            aria-live="polite"
          >
            <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-brand" />
            <p className="min-w-0 truncate text-[11px] text-copy-secondary">
              {statusText ?? "Generating technical specification…"}
            </p>
          </div>
        ) : null}
        {generationError ? (
          <p className="mb-3 rounded-xl border border-surface-border bg-elevated px-3 py-2 text-xs text-error">
            {generationError}
          </p>
        ) : null}
        <div className="mb-3 flex items-center gap-2 px-1">
          <FileText className="h-4 w-4 text-brand" />
          <p className="text-sm font-medium text-copy-primary">Project specs</p>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-copy-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : error ? (
              <p className="rounded-xl border border-surface-border bg-elevated px-3 py-2 text-xs text-error">
                {error}
              </p>
            ) : specs.length === 0 ? (
              <p className="rounded-xl border border-surface-border bg-elevated px-3 py-4 text-center text-xs leading-5 text-copy-muted">
                Generated specs will appear here.
              </p>
            ) : (
              specs.map((spec) => (
                <div
                  key={spec.id}
                  className="flex items-center gap-2 rounded-xl border border-surface-border bg-elevated transition-colors hover:bg-subtle"
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 rounded-lg px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    onClick={() => setSelectedSpec(spec)}
                  >
                    <p className="truncate text-xs font-medium text-copy-primary">
                      {spec.filename}
                    </p>
                    <time className="mt-0.5 block text-[11px] text-copy-muted">
                      {formatSpecDate(spec.createdAt)}
                    </time>
                  </button>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 text-copy-muted hover:text-brand"
                  >
                    <a
                      href={`/api/projects/${room.id}/specs/${spec.id}/download`}
                      aria-label={`Download ${spec.filename}`}
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <SpecPreviewDialog
        content={content}
        isLoading={isPreviewLoading}
        error={previewError}
        projectId={room.id}
        spec={selectedSpec}
        onOpenChange={(open) => {
          if (!open) closePreview();
        }}
      />
    </>
  );
}

interface ProjectSpecSummary {
  id: string;
  createdAt: string;
  filename: string;
}

function formatSpecDate(createdAt: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(createdAt));
}

function SpecPreviewDialog({
  content,
  error,
  isLoading,
  projectId,
  spec,
  onOpenChange,
}: {
  content: string | null;
  error: string | null;
  isLoading: boolean;
  projectId: string;
  spec: ProjectSpecSummary | null;
  onOpenChange: (open: boolean) => void;
}) {
  const downloadUrl = spec
    ? `/api/projects/${projectId}/specs/${spec.id}/download`
    : "";

  return (
    <Dialog open={Boolean(spec)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] max-w-3xl gap-0 overflow-hidden rounded-3xl border border-surface-border bg-surface p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-surface-border px-5 py-4 pr-12">
          <DialogTitle className="truncate text-copy-primary">
            {spec?.filename ?? "Specification"}
          </DialogTitle>
          {spec ? (
            <DialogDescription className="text-copy-muted">
              Generated {formatSpecDate(spec.createdAt)}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        <ScrollArea className="h-[min(65svh,42rem)] px-5 py-5">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-copy-muted">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : error ? (
            <p className="rounded-xl border border-surface-border bg-elevated px-3 py-2 text-sm text-error">
              {error}
            </p>
          ) : content ? (
            <ReactMarkdown components={markdownComponents}>
              {content}
            </ReactMarkdown>
          ) : null}
        </ScrollArea>

        <DialogFooter className="mx-0 mb-0 rounded-none border-surface-border bg-elevated/60 px-5 py-3 sm:justify-between">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
          {spec ? (
            <Button asChild type="button">
              <a href={downloadUrl}>
                <Download data-icon="inline-start" className="h-4 w-4" />
                Download
              </a>
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const markdownComponents = {
  h1: (props: ComponentProps<"h1">) => (
    <h1
      className="mb-5 text-2xl font-semibold tracking-tight text-copy-primary"
      {...props}
    />
  ),
  h2: (props: ComponentProps<"h2">) => (
    <h2
      className="mb-3 mt-7 text-lg font-semibold text-copy-primary first:mt-0"
      {...props}
    />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3
      className="mb-2 mt-5 text-sm font-semibold text-copy-primary"
      {...props}
    />
  ),
  p: (props: ComponentProps<"p">) => (
    <p className="mb-3 text-sm leading-6 text-copy-secondary" {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul
      className="mb-3 list-disc space-y-1 pl-5 text-sm leading-6 text-copy-secondary"
      {...props}
    />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol
      className="mb-3 list-decimal space-y-1 pl-5 text-sm leading-6 text-copy-secondary"
      {...props}
    />
  ),
  li: (props: ComponentProps<"li">) => <li {...props} />,
  code: (props: ComponentProps<"code">) => (
    <code
      className="rounded bg-subtle px-1 py-0.5 font-mono text-[0.85em] text-brand"
      {...props}
    />
  ),
  pre: (props: ComponentProps<"pre">) => (
    <pre
      className="mb-3 overflow-x-auto rounded-xl border border-surface-border bg-base p-3 text-xs leading-5 text-copy-secondary"
      {...props}
    />
  ),
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className="mb-3 border-l-2 border-brand pl-3 text-sm italic text-copy-secondary"
      {...props}
    />
  ),
};
