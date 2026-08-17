# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Complete (`12-shape-panel` + canvas overlay chrome / Liveblocks best-practice pass)

## Current Goal

- None. AI Copilot panel stays closed until the navbar AI button is clicked.

## Completed

- `01-design-system` — shadcn/ui (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea), `cn()` in `lib/utils.ts`, lucide-react, dark theme tokens in `app/globals.css`
- `02-editor` — editor navbar, overlay project sidebar (My Projects / Shared empty states, New Project), reusable dialog pattern (title, description, footer; no feature dialogs yet)
- `03-auth` — Clerk `dark` theme + CSS variable appearance, split sign-in/sign-up layout, resource-based `auth.protect()` on `/` and `/editor`, navbar `UserButton`
- `04-project-dialogs` — `/editor` home, create/rename/delete dialogs via `DialogPattern`, `useProjectDialogs` for dialog/form/loading state, owned-only sidebar rename/delete, mobile sidebar scrim, mock projects only
- `05-prisma` — `Project` / `ProjectCollaborator` in `prisma/models/project.prisma`, cached `lib/prisma.ts` (Accelerate vs `@prisma/adapter-pg`), initial project migration
- `06-project-apis` — owner-scoped REST routes: `GET`/`POST /api/projects`, `PATCH`/`DELETE /api/projects/[projectId]`; Clerk `userId` as `ownerId`; `401` unauthenticated, `403` non-owner mutations; create defaults name to `Untitled Project`
- `07-wire-editor-home` — server-fetched owned/shared sidebar lists, `useProjectActions` for create/rename/delete, create navigates to `/editor/[projectId]`, room id aligned with project id
- `08-editor-workspace-shell` — `/editor/[roomId]` server page with `lib/project-access.ts` (Clerk `userId` + primary email, owner/collaborator check); unauthenticated redirect to `/sign-in`; missing/unauthorized projects render `AccessDenied`; workspace navbar shows project name plus inert Share and AI sidebar toggle; overlay `ProjectSidebar` highlights the current room; canvas placeholder fills remaining space; right AI sidebar is a placeholder only
- `09-share-dialog` — workspace Share dialog; `GET`/`POST /api/projects/[projectId]/collaborators` and `DELETE .../collaborators/[collaboratorId]`; invite/remove owner-only; list readable by members; Clerk Backend API enriches name/avatar; copy link shows temporary `Copied!`; no local user table
- `10-liveblocks-setup` — `liveblocks.config.ts` defines Presence (cursor, isThinking) and UserMeta (id, name, avatar, color); cached Liveblocks node client in `lib/liveblocks.ts` with deterministic cursor color helper; `POST /api/liveblocks-auth` requires Clerk auth, verifies project access via `project-access.ts`, ensures room exists (create if needed), returns session token with user metadata; `npm run build` passes
- `11-base-canvas` — `types/canvas.ts` defines CanvasNodeData (label, color, shape), CanvasNode, CanvasEdge types; `components/editor/canvas-wrapper.tsx` sets up LiveblocksProvider with `/api/liveblocks-auth`, RoomProvider with initial presence and storage, ClientSideSuspense with loading/error fallbacks; React Flow wired via `useLiveblocksFlow` with suspense, empty initial nodes/edges, loose connection mode, fitView, MiniMap, Controls, dot-pattern Background; `npm run build` and `npm run lint` pass
- `12-shape-panel` — `types/canvas.ts` extended with CanvasShape type (rectangle, diamond, circle, pill, cylinder, hexagon), DEFAULT_SHAPE_SIZES, DEFAULT_NODE_COLOR, SHAPE_ICONS, SHAPE_NAMES; `components/editor/shape-panel.tsx` floating pill toolbar with 6 draggable shape buttons using lucide-react icons, drag payload includes shape and default size; `components/editor/canvas-wrapper.tsx` adds onDragOver/onDrop handlers, uses useReactFlow hook with screenToFlowPosition for coordinate conversion, generates unique node IDs (shape-timestamp-counter), creates CanvasNode with custom type; CanvasNodeComponent renders all shapes as bordered rectangles with centered label; `npm run build` and `npm run lint` pass
- Canvas overlay chrome + DnD — full-bleed dotted canvas (no inset card); overlay sidebars that fully slide off-screen; shape drop writes through Liveblocks `onNodesChange` add; `npm run lint` and `npm run build` pass
- Liveblocks best-practice pass — suspense imports, `react-error-boundary`, `Cursors`, `getOrCreateRoom`, forbidden auth body, connection listeners, `preventUnsavedChanges`; `npm run lint` and `npm run build` pass

## In Progress

- None yet.

## Next Up

- Next feature unit from `context/feature-specs/`

## Open Questions

- None.

## Architecture Decisions

- shadcn/ui is the component foundation; generated files in `components/ui/` are not modified after install. Theme mapping lives in `globals.css`.
- Dark-only theme: tokens from `ui-context.md` are applied on `:root` and `.dark`. The document root always has the `dark` class. shadcn semantic tokens (`background`, `primary`, `card`, …) map onto those product tokens.
- Editor chrome lives in `components/editor/`. The canvas is full-bleed under the transparent navbar (`bg-base` + 20px dot grid). Project and AI sidebars are `absolute` overlays (`z-30`, `bg-surface/95`, `shadow-lg`) and never dock in the flex row. Closed sidebars translate fully off-screen (`calc(100% + 1.5rem)`), clipped by `overflow-hidden` on the workspace pane. Sidebar open state is owned by `EditorShell`. On mobile, the backdrop scrim closes the project sidebar on outside tap and marks editor content `inert`. Feature dialogs render from one `ProjectDialogs` switch. `useProjectActions` owns dialog state and create/rename/delete API calls. `/editor` loads owned and shared project lists on the server and passes them to the sidebar. Create navigates to `/editor/[roomId]`; the project id is the Liveblocks room id (`slug` + short suffix). Rename refreshes; delete of the active workspace returns to `/editor`. The workspace route is a server component: access is resolved in `lib/project-access.ts` (owner or collaborator via primary email). Missing and unauthorized rooms render `AccessDenied` instead of a 404. The navbar puts the project name and a Workspace label on the left; Share (outline pill) and AI (cyan pill) sit on the right. Owners can invite and remove collaborators and copy the project link; collaborators see a read-only list. The canvas uses a React Flow-style **dot grid** (`.canvas-dots` / `<Background variant="dots" gap={20}>`). The right AI panel is a Copilot placeholder with no chat. Visual chrome is specified in `context/ui-context.md`.
- Clerk is the auth layer. `proxy.ts` runs `clerkMiddleware()` only. Protected pages and layouts call `auth.protect()`. API route handlers return `401` JSON when `userId` is missing. Sign-in and sign-up stay public. Clerk appearance uses the `dark` theme with CSS variable overrides only (no hardcoded colors). Editor home is `/editor`; a project workspace is `/editor/[roomId]`. `/` only redirects signed-in users to `/editor`. Unauthenticated visits to a workspace redirect to `/sign-in`.
- Prisma schema is multi-file: generator/datasource in `prisma/schema.prisma`, project models in `prisma/models/project.prisma`. `Project.ownerId` is a Clerk user ID. `lib/prisma.ts` exports one cached client: Accelerate when `DATABASE_URL` starts with `prisma+postgres://`, otherwise `@prisma/adapter-pg`. Import Prisma Client only from server-side code.
- Project APIs are owner-scoped for mutations. Collaborator membership is `GET /api/projects/[projectId]/collaborators` for members; invite (`POST`) and remove (`DELETE /api/projects/[projectId]/collaborators/[collaboratorId]`) are owner-only. Names and avatars come from the Clerk Backend API; collaborators stay keyed by email with no local user table. The editor home is a server component that loads owned and shared lists via `listEditorSidebarProjects`. Create may send a client-generated room id so `Project.id` matches the Liveblocks room id. The editor UI uses that real data; there is no mock project list.
- **Liveblocks + React Flow integration**: Hooks and providers come from `@liveblocks/react/suspense`. `liveblocks.config.ts` types Presence, Storage (`flow` LiveObject of node/edge LiveMaps), UserMeta, RoomInfo, and related slots. Canvas uses `LiveblocksProvider` (`throttle={16}`, `preventUnsavedChanges`, badge `top-right`) + `RoomProvider`. Loading uses `ClientSideSuspense`; errors use `react-error-boundary`. `useLiveblocksFlow({ suspense: true })` syncs nodes/edges. `@liveblocks/react-flow` `Cursors` writes pointer position into Presence and renders other users from session `userInfo` (not `resolveUsers`). Connection issues use `useErrorListener` and `useLostConnectionListener`. Custom node type `canvasNode` is registered via `nodeTypes`.
- **Liveblocks auth**: Access tokens (`prepareSession`) after Prisma membership checks — permissions live in the app DB, not Liveblocks `usersAccesses`. Auth failures return `{ error: "forbidden", reason }` so the client does not retry forever. Rooms are created with `getOrCreateRoom` and private `defaultAccesses: []`; the session then `allow`s the requested room with `FULL_ACCESS`.
- **Shape panel UX**: Floating pill toolbar at bottom-center with draggable shape buttons. Drag payload uses `application/omniarch-shape` plus `text/plain` fallback (shape + default size). Drop is handled on the canvas wrapper and React Flow (`preventDefault` on `dragover`). Coordinates use `useReactFlow().screenToFlowPosition`. New nodes are persisted with Liveblocks `onNodesChange([{ type: "add", item }])` — not React Flow `addNodes` on a controlled store. Node IDs generated as `${shape}-${timestamp}-${counter}`. All shapes initially render as bordered rectangles with centered label (shape-specific visuals deferred).

## Session Notes

- Implemented `context/feature-specs/01-design-system.md`. Do not edit `components/ui/*`.
- Implemented `context/feature-specs/02-editor.md`. Navbar toggle uses `PanelLeftOpen` / `PanelLeftClose`. Dialog pattern is exported but unused until a later chapter.
- Implemented `context/feature-specs/03-auth.md`. Resource-based auth. `npm run build` passes.
- Implemented `context/feature-specs/04-project-dialogs.md`. Navbar unchanged. No API or persistence. `npm run lint` and `npm run build` pass.
- Implemented `context/feature-specs/05-prisma.md`. Single `init` migration for Project models. `npm run build` passes.
- Implemented `context/feature-specs/06-project-apis.md`. No UI wiring. `npm run build` passes.
- Implemented `context/feature-specs/07-wire-editor-home.md`. Sidebar uses real project data. `npm run build` passes.
- Implemented `context/feature-specs/08-editor-workspace-shell.md`. Access helpers live outside the page. No canvas, Liveblocks, AI chat, or sharing behavior. `npm run lint` and `npm run build` pass.
- Implemented `context/feature-specs/09-share-dialog.md`. Share dialog opens from the workspace navbar. `npm run lint` and `npm run build` pass.
- Restyled editor chrome to inset rounded panels (navbar, sidebars, canvas). Later replaced by full-bleed canvas + overlay sidebars (see canvas review findings). Home create CTA stays centered after login. Locked in `context/ui-context.md` (Editor Chrome, dot grid, pill CTAs, shared-tab follows current room).
- Implemented `context/feature-specs/10-liveblocks-setup.md`. Installed `@liveblocks/node` for server-side auth. `liveblocks.config.ts` types Presence (cursor, isThinking) and UserMeta (id, info: name, avatar, color). `lib/liveblocks.ts` exports cached Liveblocks client and `getCursorColor()` deterministic color mapper. `POST /api/liveblocks-auth` validates Clerk auth, checks project access via `findAccessibleProjectForViewer`, creates room if missing, returns session token with user metadata. `npm run build` passes.
- Implemented `context/feature-specs/11-base-canvas.md`. Created `types/canvas.ts` with CanvasNodeData, CanvasNode, CanvasEdge types. Built `components/editor/canvas-wrapper.tsx` with LiveblocksProvider, RoomProvider, ClientSideSuspense, error boundary. Wired React Flow via `useLiveblocksFlow` with suspense, loose connection mode, fitView, MiniMap, Controls, dot Background. Removed legacy `.canvas-dots` CSS class (now handled by React Flow Background component). `npm run build` and `npm run lint` pass.
- Implemented `context/feature-specs/12-shape-panel.md`. Extended `types/canvas.ts` with CanvasShape union (6 shapes), DEFAULT_SHAPE_SIZES, DEFAULT_NODE_COLOR, SHAPE_ICONS, SHAPE_NAMES. Created `components/editor/shape-panel.tsx` floating pill toolbar with 6 draggable lucide-react icon buttons. Added drag/drop to canvas wrapper using `useReactFlow().screenToFlowPosition` for coordinate conversion. Node ID format: `${shape}-${timestamp}-${counter}`. CanvasNodeComponent renders all shapes as bordered rectangles with centered label. `npm run build` and `npm run lint` pass.
- Reviewed and fixed editor canvas chrome + shape drag-and-drop (see findings below). Restored `.canvas-dots`. Overlay sidebars on desktop and mobile. `npm run lint` and `npm run build` pass.
- Applied Liveblocks best practices: `@liveblocks/react/suspense`, `react-error-boundary`, React Flow `Cursors` from session userInfo, `getOrCreateRoom` with private `defaultAccesses`, `{ error: "forbidden" }` auth responses, `useErrorListener` / `useLostConnectionListener`, `preventUnsavedChanges`, `throttle={16}`, ESLint `useMutation` deps. `npm run lint` and `npm run build` pass.
- AI Copilot sidebar starts closed on home and project load; it only opens from the navbar AI button.
- Project sidebar footer is only the New Project pill. Rename/delete sit inside the selected project row background.
- Park Liveblocks `#liveblocks-badge` and React Flow `.react-flow__attribution` off-canvas via CSS `transform` (nodes stay in the DOM).

## Canvas review findings (fixed)

### Drag and drop

- Shape buttons set only `application/omniarch-shape`. Some browsers ignore custom MIME types; payload now also writes `text/plain`.
- WebKit treats `<button>` as non-draggable (`-webkit-user-drag: none`). Buttons now set `WebkitUserDrag: element`; icons use `pointer-events-none`.
- Drop handlers lived behind a child ref (`CanvasDropHandler`) and called `useReactFlow().addNodes` while nodes were controlled by Liveblocks. Adds did not persist. Drop now calls `onNodesChange([{ type: "add", item }])` from `useLiveblocksFlow`, with `onDragOver`/`onDrop` on both the wrapper and React Flow (`preventDefault` so the pane is a valid drop target).
- `screenToFlowPosition({ x: clientX, y: clientY })` still converts drop coordinates through pan/zoom.

### Canvas visuals

- Workspace pane used `gap-2 px-2 pb-2` plus a `rounded-2xl border` wrapper, so the flow sat in a floating card on `--bg-base`.
- React Flow `Background` used hardcoded `#374151`, `gap={16}`, and `opacity-50`, so the grid did not match `.canvas-dots` (which had also been removed from `globals.css`).
- Canvas now fills the pane edge-to-edge: no canvas border, radius, or box-shadow; dots at 20px using the text-primary mix token.

### Sidebars

- Desktop docked sidebars in the flex row (`relative` + `shrink-0`), shrinking the canvas instead of floating over it.
- Closed desktop AI sidebar unmounted (`return null`); project sidebar used `hidden` vs overlay `translate`, so close behavior was inconsistent.
- Overlay close used `-translate-x-[calc(100%+0.5rem)]` with `left-2` and no parent `overflow-hidden`, so a sliver/shadow could peek. Closed state is now `translateX(calc(100% + 1.5rem))` with workspace `overflow-hidden`.

## Liveblocks review findings (fixed)

- Client hooks imported from `@liveblocks/react` instead of `@liveblocks/react/suspense`.
- Custom `window` `error` listener stood in for `react-error-boundary` + `ClientSideSuspense`.
- No React Flow `Cursors`; Presence `cursor` was unused. Default `Cursors` uses `useUser`/`resolveUsers`; the canvas cursor reads `other.info` from the session instead.
- Rooms used `getRoom` + `createRoom` with public `defaultAccesses: ["room:write"]`. Now `getOrCreateRoom` with private `[]`.
- 401/403 auth responses were plain text, so the client retried forever. They now return `{ error: "forbidden", reason }`.
- Auth body was parsed with `request.json()` instead of `parseJsonBody`.
- No lost-connection or room-connection error UI; no `preventUnsavedChanges`.
- Liveblocks badge sat on the MiniMap corner; it is now `top-right`. Portaled UI uses `.lb-portal { z-index: 50 }` above overlay sidebars.
- ESLint did not check `useMutation` dependency arrays.
