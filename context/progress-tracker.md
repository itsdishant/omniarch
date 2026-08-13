# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Complete (`02-editor`)

## Current Goal

- None. Editor chrome unit is done.

## Completed

- `01-design-system` — shadcn/ui (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea), `cn()` in `lib/utils.ts`, lucide-react, dark theme tokens in `app/globals.css`
- `02-editor` — editor navbar, overlay project sidebar (My Projects / Shared empty states, New Project), reusable dialog pattern (title, description, footer; no feature dialogs yet)

## In Progress

- None yet.

## Next Up

- Next feature unit from `context/feature-specs/`

## Open Questions

- None.

## Architecture Decisions

- shadcn/ui is the component foundation; generated files in `components/ui/` are not modified after install. Theme mapping lives in `globals.css`.
- Dark-only theme: tokens from `ui-context.md` are applied on `:root` and `.dark`. The document root always has the `dark` class. shadcn semantic tokens (`background`, `primary`, `card`, …) map onto those product tokens.
- Editor chrome lives in `components/editor/`. The project sidebar is an overlay (`absolute`, slides from the left) and does not shift the canvas. Sidebar open state is owned by `EditorShell`. Feature dialogs compose `DialogPattern` later; `components/ui/dialog.tsx` stays unmodified.

## Session Notes

- Implemented `context/feature-specs/01-design-system.md`. Do not edit `components/ui/*`.
- Implemented `context/feature-specs/02-editor.md`. Navbar toggle uses `PanelLeftOpen` / `PanelLeftClose`. Dialog pattern is exported but unused until a later chapter.
