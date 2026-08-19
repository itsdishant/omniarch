"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ClientSideSuspense } from "@liveblocks/react/suspense";
import { Bot, Download, FileText, Loader2, Plus, Send, X } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAiChat, type AiChatFeedItem } from "@/hooks/use-ai-chat";
import { useDesignAgentRun } from "@/hooks/use-design-agent-run";
import { useAiStatus } from "@/hooks/use-ai-status";
import { NODE_COLORS } from "@/types/canvas";
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
            <ArchitectTab
              isGenerating={isGenerating}
              statusText={statusText}
            />
          </TabsContent>
          <TabsContent value="specs" className="min-h-0">
            <SpecsTab />
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
                    message.role === "user"
                      ? "opacity-80"
                      : "text-copy-muted",
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

function SpecsTab() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto px-3 pb-3 pt-3">
      <Button
        type="button"
        className="w-full bg-accent text-white hover:bg-accent/80"
      >
        <Plus data-icon="inline-start" className="h-4 w-4" />
        Generate Spec
      </Button>
      <div className="rounded-xl border border-surface-border bg-elevated p-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-subtle text-brand">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-copy-primary">
              E-commerce backend spec
            </h3>
            <p className="mt-1 text-xs leading-5 text-copy-muted">
              Services, data flows, and deployment boundaries for a resilient
              commerce platform.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled
          className="mt-4 w-full"
        >
          <Download data-icon="inline-start" className="h-3.5 w-3.5" />
          Download spec
        </Button>
      </div>
    </div>
  );
}
