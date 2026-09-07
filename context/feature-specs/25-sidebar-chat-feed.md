# Sidebar Chat Feed

Add real-time room chat to the AI sidebar using a separate Liveblocks `ai-chat`
feed.

This is only for chat messages. Keep it separate from `ai-status-feed`, which
handles AI progress and presence updates.

## Implementation

1. Add the `ai-chat` feed.

   Before implementing, check the existing Liveblocks setup and follow the same
   feed patterns already used in the project.
   - create or reuse a Liveblocks feed named `ai-chat`
   - keep it room-scoped
   - do not mix it with `ai-status-feed`

2. Wire the chat feed into the sidebar.

   Subscribe only after the Liveblocks room is connected. `useFeedMessages` for
   feeds uses a 5s timeout with no retry, so fetching during the outer
   `ClientSideSuspense` fallback (before the websocket is up) can cache an empty
   or failed query and hide existing history on first project open.

   - wrap live chat hooks in `AiChatReady` (`hooks/use-ai-chat.ts`) so they run
     only when `useStatus() === "connected"`
   - do not mount `useAiChat` / suspense `useFeedMessages` in the outer sidebar
     loading fallback
   - create-or-reuse feed `ai-chat` after connect (`useCreateFeed`)
   - render validated messages in time order
   - show sender, WhatsApp-style day pills, 12-hour bubble times, and content
   - keep the styling consistent with the existing sidebar UI
   - use Tailwind utilities and existing shadcn components where they fit

3. Add message sending.
   - allow users in the room to send messages to `ai-chat`
   - use the existing sidebar input and send button
   - clear the input after a successful send
   - show a small error state if sending fails

4. Add message validation.
   - define or reuse a Zod schema in `types/tasks.ts`
   - message shape should include sender, role, content, and timestamp
   - validate feed messages before rendering them

5. Chat timestamps (WhatsApp-style, 12-hour clock).

   Shared formatters live in `lib/utils.ts` (`formatClock`, `formatDateTime`,
   `formatChatDayLabel`, `isSameLocalDay`). Use 12-hour time everywhere
   (`en-US`, `hour12: true`), for example `2:30 PM`.

   - insert a centered day pill when the calendar day changes:
     `Today`, `Yesterday`, or `January 2, 2023`
   - style pills as `rounded-full bg-subtle` with `text-copy-muted`
   - put a 12-hour clock (`formatClock`) at the bottom-right of every bubble
   - spec list/preview dates use `formatDateTime` (`Apr 6, 2023, 2:30 PM`)

## Scope Limits

- don’t add AI-generated replies yet
- don’t trigger backend AI tasks
- don’t mix chat messages with status messages
- don’t create a parallel realtime system outside Liveblocks
- keep this focused on collaborative sidebar chat only

## Check When Done

- Sidebar subscribes to the `ai-chat` feed after the room is connected.
- Opening a project with existing messages shows that history on first open.
- Users can send chat messages through the existing sidebar input.
- Chat messages are validated before rendering.
- Day pills and 12-hour bubble times match the WhatsApp-style layout.
- `ai-chat` remains separate from `ai-status-feed`.
- `npm run build` passes.
