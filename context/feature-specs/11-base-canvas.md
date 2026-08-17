# Base Canvas

Replace the canvas placeholder with a Liveblocks-backed React Flow canvas.

## Implementation

1. Keep the workspace page server-side.

2. Create a client-side editor/canvas wrapper that sets up the Liveblocks room.

   It should include:
   - `LiveblocksProvider` and `RoomProvider` from `@liveblocks/react/suspense`
   - auth endpoint `/api/liveblocks-auth`
   - `throttle={16}`, `preventUnsavedChanges`, badge `top-right`
   - initial presence with `cursor: null` and `isThinking: false`
   - `ClientSideSuspense` with a loading fallback
   - `react-error-boundary` `ErrorBoundary` for Liveblocks/connection failures
   - `useErrorListener` / `useLostConnectionListener` for reconnect UI

3. Wire React Flow to Liveblocks state.
   - use `useLiveblocksFlow` with suspense
   - start with empty nodes and edges
   - pass the synced nodes, edges, and change handlers into `ReactFlow`
   - render `@liveblocks/react-flow` `Cursors` (session `userInfo`, not `resolveUsers`)
   - import `@liveblocks/react-ui/styles.css` and `@liveblocks/react-flow/styles.css`

4. Add shared canvas types in `types/canvas.ts`.

   Node data should support:
   - label
   - color
   - shape

   Also define the custom node and edge types:
   - `canvasNode`
   - `canvasEdge`

5. Render the basic canvas.

   Include:
   - loose connection behavior
   - `fitView`
   - `MiniMap`
   - dot-pattern background

## Scope Limits

- don’t add controls yet
- don’t add custom node or edge rendering yet
- don’t add persistence logic
- don’t add AI behavior
- keep this focused on the collaborative canvas foundation

## Check When Done

- Client canvas wrapper sets up the Liveblocks room.
- React Flow uses Liveblocks-synced nodes and edges.
- Shared canvas types exist in `types/canvas.ts`.
- `npm run build` passes.
