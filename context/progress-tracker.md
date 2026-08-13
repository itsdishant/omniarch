# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Complete (`03-auth`)

## Current Goal

- None. Auth unit is done.

## Completed

- `01-design-system` — shadcn/ui (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea), `cn()` in `lib/utils.ts`, lucide-react, dark theme tokens in `app/globals.css`
- `02-editor` — editor navbar, overlay project sidebar (My Projects / Shared empty states, New Project), reusable dialog pattern (title, description, footer; no feature dialogs yet)
- `03-auth` — Clerk `dark` theme + CSS variable appearance, split sign-in/sign-up layout, `proxy.ts` protection from sign-in/sign-up env vars, `/` redirects to `/editor` or `/sign-in`, navbar `UserButton`

## In Progress

- None yet.

## Next Up

- Next feature unit from `context/feature-specs/`

## Open Questions

- None.

## Architecture Decisions

- shadcn/ui is the component foundation; generated files in `components/ui/` are not modified after install. Theme mapping lives in `globals.css`.
- Dark-only theme: tokens from `ui-context.md` are applied on `:root` and `.dark`. The document root always has the `dark` class. shadcn semantic tokens (`background`, `primary`, `card`, …) map onto those product tokens.
- Editor chrome lives in `components/editor/`. The project sidebar is an overlay (`absolute`, slides from the left) and does not shift the canvas. Sidebar open state is owned by `EditorShell`. When closed, the sidebar is `inert`; closing it returns focus to the navbar toggle. `DialogPattern` is controlled-only (`open` and `onOpenChange` are required). Feature dialogs compose it later; `components/ui/dialog.tsx` stays unmodified.
- Clerk is the auth layer. `proxy.ts` protects all routes except the sign-in and sign-up paths from existing `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL` env vars. Clerk appearance uses the `dark` theme with CSS variable overrides only (no hardcoded colors). The editor workspace lives at `/editor`; `/` only redirects.

## Session Notes

- Implemented `context/feature-specs/01-design-system.md`. Do not edit `components/ui/*`.
- Implemented `context/feature-specs/02-editor.md`. Navbar toggle uses `PanelLeftOpen` / `PanelLeftClose`. Dialog pattern is exported but unused until a later chapter.
- Implemented `context/feature-specs/03-auth.md`. `npm run build` passes.
