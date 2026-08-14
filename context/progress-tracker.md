# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Complete (`04-project-dialogs`)

## Current Goal

- None. Project dialogs unit is done.

## Completed

- `01-design-system` — shadcn/ui (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea), `cn()` in `lib/utils.ts`, lucide-react, dark theme tokens in `app/globals.css`
- `02-editor` — editor navbar, overlay project sidebar (My Projects / Shared empty states, New Project), reusable dialog pattern (title, description, footer; no feature dialogs yet)
- `03-auth` — Clerk `dark` theme + CSS variable appearance, split sign-in/sign-up layout, `proxy.ts` protection from sign-in/sign-up env vars, `/` redirects to `/editor` or `/sign-in`, navbar `UserButton`
- `04-project-dialogs` — `/editor` home, create/rename/delete dialogs via `DialogPattern`, `useProjectDialogs` for dialog/form/loading state, owned-only sidebar rename/delete, mobile sidebar scrim, mock projects only

## In Progress

- None yet.

## Next Up

- Next feature unit from `context/feature-specs/`

## Open Questions

- None.

## Architecture Decisions

- shadcn/ui is the component foundation; generated files in `components/ui/` are not modified after install. Theme mapping lives in `globals.css`.
- Dark-only theme: tokens from `ui-context.md` are applied on `:root` and `.dark`. The document root always has the `dark` class. shadcn semantic tokens (`background`, `primary`, `card`, …) map onto those product tokens.
- Editor chrome lives in `components/editor/`. The project sidebar is an overlay (`absolute`, slides from the left) and does not shift the canvas. Sidebar open state is owned by `EditorShell`. When closed, the sidebar is `inert`; closing it returns focus to the navbar toggle. On mobile, a backdrop scrim closes the sidebar on outside tap. `DialogPattern` is controlled-only (`open` and `onOpenChange` are required). Create/rename/delete dialogs compose it; `components/ui/dialog.tsx` stays unmodified. Dialog and form state live in `useProjectDialogs`. Project lists use mock data only.
- Clerk is the auth layer. `proxy.ts` protects all routes except the sign-in and sign-up paths from existing `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL` env vars. Clerk appearance uses the `dark` theme with CSS variable overrides only (no hardcoded colors). The editor workspace lives at `/editor`; `/` only redirects.

## Session Notes

- Implemented `context/feature-specs/01-design-system.md`. Do not edit `components/ui/*`.
- Implemented `context/feature-specs/02-editor.md`. Navbar toggle uses `PanelLeftOpen` / `PanelLeftClose`. Dialog pattern is exported but unused until a later chapter.
- Implemented `context/feature-specs/03-auth.md`. `npm run build` passes.
- Implemented `context/feature-specs/04-project-dialogs.md`. Navbar unchanged. No API or persistence. `npm run lint` and `npm run build` pass.
