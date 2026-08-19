# Spec UI Integration

Integrate spec generation results into the editor so users can view, preview,
and download specs from the existing AI sidebar Specs tab. This includes the
"Generate spec" button, real-time run tracking, error handling, and the preview
modal.

## Implementation

### 1. Specs Tab Layout (`components/editor/ai-sidebar.tsx` → `SpecsTab` component)

The Specs tab is the second tab in the AI sidebar (`TabsTrigger value="specs"`).
It renders a vertical layout with:

- **Generate Spec Button** (primary CTA):
  - Full-width cyan button (`bg-accent text-accent-foreground`) with Plus icon
  - Text: "Generate spec" (idle) / "Generating spec…" with Loader2 spinner (active)
  - Disabled while a run is active (`isRunActive` from `useSpecGenerationRun`)
  - Click handler calls `generateSpec()` → `startRun()` from the hook

- **Active Run Status Strip** (shown only during generation):
  - Elevated card with pulsing cyan dot and status text
  - Status text comes from `statusText` prop (published by the task via `ai-status-feed`)
  - Default fallback: "Generating technical specification…"

- **Error Display** (shown on generation failure):
  - Red-bordered elevated card with error message from `generationError` state

- **Specs List Header**:
  - FileText icon (cyan) + "Project specs" label

- **Specs List** (inside `ScrollArea` for vertical scrolling):
  - Loading state: centered Loader2 spinner
  - Error state: red-bordered card with error message
  - Empty state: "Generated specs will appear here."
  - List items (clickable rows):
    - Left: filename (truncated) + timestamp (formatted via `formatSpecDate`)
    - Right: Download button (ghost, icon-only) wrapping an `<a>` tag pointing to `/api/projects/${room.id}/specs/${spec.id}/download`
    - Clicking the row (not the download button) opens the preview modal

### 2. Spec Generation Hook (`hooks/use-spec-generation-run.ts`)

The `useSpecGenerationRun` hook manages the entire generation lifecycle:

- **State**:
  - `handle`: `{ runId, publicToken }` or null
  - `generationError`: string or null
  - `finishingRef`: ref to prevent duplicate completion handling

- **Realtime Run Tracking** (`useRealtimeRun` from `@trigger.dev/react-hooks`):
  - Subscribes to the Trigger.dev run using `runId` and `publicToken`
  - `enabled: Boolean(handle?.runId && handle?.publicToken)`
  - `skipColumns: ["payload", "output"]` to reduce payload size
  - `onComplete` callback:
    - Checks `finishingRef` to avoid double-handling
    - Determines error from `completeError` or `completed.status !== "COMPLETED"`
    - On error: sets `generationError`, clears `handle`
    - On success: calls `options.onComplete()` (refreshes spec list), then clears `handle`
    - Errors during `onComplete` are caught and set as `generationError`

- **Error Effect**: If `useRealtimeRun` reports an error while a handle exists, sets `generationError` and clears handle

- **Start Run** (`startRun()`):
  - Returns early if a handle already exists
  - Clears `generationError`
  - POSTs to `/api/ai/spec` with:
    - `roomId`: from `useRoom()` (current Liveblocks room = projectId)
    - `chatHistory`: mapped from `useAiChat()` messages to `ChatMessage` format
    - `nodes`: empty array (task reads live canvas via `readCanvasGraph`)
    - `edges`: empty array (task reads live canvas via `readCanvasGraph`)
  - On response: validates `runId` and `publicToken`, sets `handle`, resets `finishingRef`
  - On error: sets `generationError`, throws

- **Returns**: `{ error: generationError, isRunActive: handle !== null, startRun }`

### 3. Spec List Loading (`SpecsTab` → `loadSpecs`)

- Fetches from `GET /api/projects/${room.id}/specs`
- Sets `isLoading`, `error`, and `specs` state
- Called on mount and after generation completes (via `onComplete` callback)

### 4. Preview Modal (`SpecPreviewDialog` component)

- Controlled by `selectedSpec` state (set when user clicks a list item)
- Uses shadcn/ui `Dialog` with `max-h-[calc(100svh-2rem)] max-w-3xl`
- **Header**: spec filename + "Generated {date}" description
- **Content** (inside `ScrollArea` with `h-[min(65svh,42rem)]`):
  - Loading: centered Loader2
  - Error: red-bordered card with error message
  - Content: rendered via `ReactMarkdown` with custom components for headings, paragraphs, lists, code, pre, blockquotes
- **Footer**: Close button (outline) + Download button (wraps `<a href={downloadUrl}>`)
- `downloadUrl` = `/api/projects/${projectId}/specs/${spec.id}/download`
- `onOpenChange` closes preview when dialog closes

### 5. Preview Loading (`SpecsTab` → `useEffect` on `selectedSpec`)

- When `selectedSpec` changes, fetches content via `GET /api/projects/${room.id}/specs/${spec.id}/download`
- Sets `isPreviewLoading`, `content`, `previewError` state
- AbortController cleans up on unmount/spec change

### 6. Date Formatting

- `formatSpecDate(createdAt)`: Uses `Intl.DateTimeFormat` with `dateStyle: "medium"`, `timeStyle: "short"`

## UI Details

- Use existing sidebar layout (`AiSidebar` → `Tabs` → `TabsContent value="specs"`)
- Use shadcn/ui components: `Button`, `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `ScrollArea`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- Use existing colors and tokens from `globals.css` (`bg-accent`, `text-accent-foreground`, `bg-elevated`, `border-surface-border`, `text-copy-primary`, `text-copy-muted`, `text-error`, `text-brand`)
- Follow `ui-context.md` for spacing, layout, and border radius (`rounded-xl`, `rounded-2xl`, `rounded-3xl`)
- Keep the list compact and scrollable via `ScrollArea` with `min-h-0 flex-1`
- `ScrollArea` viewport has `[&>div]:!block` class to fix flex truncation for long filenames

## Data Flow Summary

1. User clicks "Generate spec" → `startRun()` → `POST /api/ai/spec`
2. Server validates, triggers `generate-spec` task, returns `{ runId, publicToken }`
3. Hook stores handle, `useRealtimeRun` subscribes to run
4. Task runs: reads canvas → generates spec → saves to Blob → creates `ProjectSpec` → publishes status to `ai-status-feed`
5. On completion: `onComplete` fires → `loadSpecs()` refreshes list
6. User clicks spec in list → `selectedSpec` set → preview modal opens
7. Preview fetches content via download endpoint → renders Markdown
8. User clicks Download (list or modal) → browser downloads from download endpoint

## Scope Limits

- Do not implement backend logic (covered in 27, 28)
- Do not fetch Blob URLs directly in the client (always use download endpoint)
- Do not store spec content in frontend state long-term (only during preview)
- Do not redesign the sidebar or tabs
- Do not add new global state (all state is local to `SpecsTab`)

## Notes

- Reuse existing fetch patterns used in the app (`fetch` with AbortController)
- Assume `ProjectSpec` API only provides metadata; content must be fetched separately via download endpoint
- The `nodes` and `edges` sent to `/api/ai/spec` are empty arrays — the task reads the live canvas via `readCanvasGraph(roomId)`
- Chat history is sourced from the `ai-chat` Liveblocks feed via `useAiChat()` hook
- Realtime run tracking uses Trigger.dev's `useRealtimeRun` with a 1-hour scoped public token
- Status updates during generation come from the `ai-status-feed` Liveblocks feed (via `statusText` prop passed from `AiSidebarLive`)

## Check When Done

- Specs tab shows "Generate spec" button with correct states (idle, loading, disabled)
- Clicking generate triggers spec generation and shows real-time status
- Spec list loads for the current project with filenames and timestamps
- Clicking a spec opens a modal with rendered Markdown content
- Download action (list item button + modal button) triggers file download
- Error states display correctly for generation failures and preview load failures
- TypeScript and build pass
