# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Complete (`07-wire-editor-home`)

## Current Goal

- None. Editor home wiring unit is done.

## Completed

- `01-design-system` — shadcn/ui (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea), `cn()` in `lib/utils.ts`, lucide-react, dark theme tokens in `app/globals.css`
- `02-editor` — editor navbar, overlay project sidebar (My Projects / Shared empty states, New Project), reusable dialog pattern (title, description, footer; no feature dialogs yet)
- `03-auth` — Clerk `dark` theme + CSS variable appearance, split sign-in/sign-up layout, resource-based `auth.protect()` on `/` and `/editor`, navbar `UserButton`
- `04-project-dialogs` — `/editor` home, create/rename/delete dialogs via `DialogPattern`, `useProjectDialogs` for dialog/form/loading state, owned-only sidebar rename/delete, mobile sidebar scrim, mock projects only
- `05-prisma` — `Project` / `ProjectCollaborator` in `prisma/models/project.prisma`, cached `lib/prisma.ts` (Accelerate vs `@prisma/adapter-pg`), initial project migration
- `06-project-apis` — owner-scoped REST routes: `GET`/`POST /api/projects`, `PATCH`/`DELETE /api/projects/[projectId]`; Clerk `userId` as `ownerId`; `401` unauthenticated, `403` non-owner mutations; create defaults name to `Untitled Project`
- `07-wire-editor-home` — server-fetched owned/shared sidebar lists, `useProjectActions` for create/rename/delete, create navigates to `/editor/[projectId]`, room id aligned with project id

## In Progress

- None yet.

## Next Up

- Next feature unit from `context/feature-specs/`

## Open Questions

- None.

## Architecture Decisions

- shadcn/ui is the component foundation; generated files in `components/ui/` are not modified after install. Theme mapping lives in `globals.css`.
- Dark-only theme: tokens from `ui-context.md` are applied on `:root` and `.dark`. The document root always has the `dark` class. shadcn semantic tokens (`background`, `primary`, `card`, …) map onto those product tokens.
- Editor chrome lives in `components/editor/`. The project sidebar is an overlay (`absolute`, slides from the left) and does not shift the canvas. Sidebar open state is owned by `EditorShell`. Overlay + mobile scrim live in `EditorWorkspacePane`. When closed, the sidebar is `inert`; closing it returns focus to the navbar toggle. On mobile, the backdrop scrim closes the sidebar on outside tap and marks editor content `inert` so obscured controls are not focusable. Feature dialogs render from one `ProjectDialogs` switch. `useProjectActions` owns dialog state and create/rename/delete API calls. `/editor` loads owned and shared project lists on the server and passes them to the sidebar. Create navigates to `/editor/[projectId]`; the project id is the Liveblocks room id (`slug` + short suffix). Rename refreshes; delete of the active workspace returns to `/editor`.
- Clerk is the auth layer. `proxy.ts` runs `clerkMiddleware()` only. Protected pages and layouts call `auth.protect()`. API route handlers return `401` JSON when `userId` is missing. Sign-in and sign-up stay public. Clerk appearance uses the `dark` theme with CSS variable overrides only (no hardcoded colors). Editor home is `/editor`; a project workspace is `/editor/[projectId]`. `/` only redirects signed-in users to `/editor`.
- Prisma schema is multi-file: generator/datasource in `prisma/schema.prisma`, project models in `prisma/models/project.prisma`. `Project.ownerId` is a Clerk user ID. `lib/prisma.ts` exports one cached client: Accelerate when `DATABASE_URL` starts with `prisma+postgres://`, otherwise `@prisma/adapter-pg`. Import Prisma Client only from server-side code.
- Project APIs are owner-scoped for mutations. The editor home is a server component that loads owned and shared lists via `listEditorSidebarProjects`. Create may send a client-generated room id so `Project.id` matches the Liveblocks room id. The editor UI uses that real data; there is no mock project list.

## Session Notes

- Implemented `context/feature-specs/01-design-system.md`. Do not edit `components/ui/*`.
- Implemented `context/feature-specs/02-editor.md`. Navbar toggle uses `PanelLeftOpen` / `PanelLeftClose`. Dialog pattern is exported but unused until a later chapter.
- Implemented `context/feature-specs/03-auth.md`. Resource-based auth. `npm run build` passes.
- Implemented `context/feature-specs/04-project-dialogs.md`. Navbar unchanged. No API or persistence. `npm run lint` and `npm run build` pass.
- Implemented `context/feature-specs/05-prisma.md`. Single `init` migration for Project models. `npm run build` passes.
- Implemented `context/feature-specs/06-project-apis.md`. No UI wiring. `npm run build` passes.
- Implemented `context/feature-specs/07-wire-editor-home.md`. Sidebar uses real project data. `npm run build` passes.
