"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Bot, Download, FileText, Plus, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const starterPrompts = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
];

type ChatMessage = { content: string; role: "assistant" | "user" };

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
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
            <ArchitectTab />
          </TabsContent>
          <TabsContent value="specs" className="min-h-0">
            <SpecsTab />
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  );
}

function ArchitectTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [draft]);

  function submit() {
    const message = draft.trim();
    if (!message) return;
    setMessages((current) => [...current, { content: message, role: "user" }]);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 px-3 pb-3 pt-3">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
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
          messages.map((message, index) => (
            <div
              key={`${message.content}-${index}`}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[88%] rounded-xl px-3 py-2 text-sm",
                  message.role === "user"
                    ? "border-2 border-brand/50 bg-accent-dim text-copy-primary"
                    : "border border-surface-border bg-elevated text-accent-foreground",
                )}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="shrink-0 rounded-xl border border-surface-border bg-elevated p-2">
        <Textarea
          ref={textareaRef}
          value={draft}
          rows={1}
          placeholder="Describe your architecture..."
          aria-label="Architecture prompt"
          className="min-h-18 max-h-40 resize-none overflow-y-auto border-0 bg-transparent px-1 py-1 text-sm shadow-none focus-visible:ring-0"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-copy-muted">
            Enter to send · Shift+Enter for a new line
          </span>
          <Button
            type="button"
            size="icon-sm"
            aria-label="Send prompt"
            className="bg-accent text-white hover:bg-accent/80"
            onClick={submit}
          >
            <Send className="h-4 w-4" />
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
