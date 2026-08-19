# Editor

We need the base chrome components that frame every editor screen — the top
navbar and the left sidebar shell. These will be reused and extended in every
chapter that follows.

## Editor Navbar

Create `components/editor/editor-navbar.tsx`.

Requirements:

- fixed-height top navbar
- left, center, and right sections
- left section contains sidebar toggle button
- use `PanelLeftOpen` / `PanelLeftClose` icons based on sidebar state
- right section stays empty for now
- dark background with subtle bottom border

## Project Sidebar

Create `components/editor/project-sidebar.tsx`.

Requirements:

- sidebar should float above the editor canvas
- opening it should not push page content
- slides in from the left
- accepts `isOpen` and `onClose` props
- header with `Projects` title + close button
- shadcn `Tabs`:
  - My Projects
  - Shared
- both tabs show empty placeholder state
- full-width `New Project` button at the bottom with `Plus` icon

## Dialog Pattern

Use the existing color tokens from `globals.css` for dialog styling.

Support:

- title
- description
- footer actions

Do not build actual dialogs yet.

## Current Navbar Behavior

- On `/editor`, the sidebar toggle remains on the left while `OmniArch` is
  centered; the project name and `Workspace` subtitle are hidden until a
  project workspace is selected.
- On `/editor/[roomId]`, the selected project name and `Workspace` subtitle
  remain on the left.

## Check when done

- new components compile without TypeScript errors
- no lint errors
- dialog pattern is ready for future use
