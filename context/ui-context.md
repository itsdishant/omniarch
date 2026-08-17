# UI Context

## Theme

Dark only. No light mode. The visual language is a dark technical workspace — near-black backgrounds, layered surfaces, and vivid accent colors for interactive elements.

All colors are defined as CSS custom properties in `globals.css` and mapped to Tailwind tokens via `@theme inline`. Components must use these tokens — no hardcoded hex values or raw Tailwind color classes like `zinc-*`.

| Role             | CSS Variable           | Hex / Value               |
| ---------------- | ---------------------- | ------------------------- |
| Page background  | `--bg-base`            | `#080809`                 |
| Surface          | `--bg-surface`         | `#111114`                 |
| Elevated surface | `--bg-elevated`        | `#18181c`                 |
| Subtle surface   | `--bg-subtle`          | `#1e1e23`                 |
| Default border   | `--border-default`     | `#2a2a30`                 |
| Subtle border    | `--border-subtle`      | `#3a3a42`                 |
| Primary text     | `--text-primary`       | `#f0f0f4`                 |
| Secondary text   | `--text-secondary`     | `#c0c0cc`                 |
| Muted text       | `--text-muted`         | `#808090`                 |
| Faint text       | `--text-faint`         | `#505060`                 |
| Brand accent     | `--accent-primary`     | `#00c8d4` (cyan)          |
| Brand dim        | `--accent-primary-dim` | `rgba(0, 200, 212, 0.12)` |
| AI accent        | `--accent-ai`          | `#6457f9` (indigo-purple) |
| AI text          | `--accent-ai-text`     | `#8b82ff`                 |
| Error            | `--state-error`        | `#ff4d4f`                 |
| Success          | `--state-success`      | `#34d399`                 |
| Warning          | `--state-warning`      | `#fbbf24`                 |

Tailwind utility names map to these variables. Use `bg-base`, `bg-surface`, `text-copy-primary`, `text-copy-muted`, `border-surface-border`, `text-brand`, `bg-accent-dim`, etc.

## Typography

| Role      | Font       | CSS Variable        |
| --------- | ---------- | ------------------- |
| UI text   | Geist Sans | `--font-geist-sans` |
| Code/mono | Geist Mono | `--font-geist-mono` |

Both fonts are loaded via `next/font/google` and applied as CSS variables on the `<html>` element. The base `body` uses Geist Sans with `antialiased`.

## Border Radius

Radius increases with surface depth — smaller for inner elements, larger for outer containers.

| Context                         | Class          |
| ------------------------------- | -------------- |
| Inline / small UI               | `rounded-xl`   |
| Cards / panels / canvas surface | `rounded-2xl`  |
| Modal / overlay                 | `rounded-3xl`  |
| Editor chrome CTAs              | `rounded-full` |

Chrome CTAs are pill-shaped: navbar **Share** and **AI**, sidebar **New Project**. Do not restyle those back to rectangular buttons.

## Canvas

### Node Color Palette

8 defined color pairs. Each pair specifies a dark node fill and a vivid contrasting text color tuned for readability on the dark canvas. Defined in `types/canvas.ts` as `NODE_COLORS`.

| Node fill | Text color | Character              |
| --------- | ---------- | ---------------------- |
| `#1F1F1F` | `#EDEDED`  | Neutral dark (default) |
| `#10233D` | `#52A8FF`  | Blue                   |
| `#2E1938` | `#BF7AF0`  | Purple                 |
| `#331B00` | `#FF990A`  | Orange                 |
| `#3C1618` | `#FF6166`  | Red                    |
| `#3A1726` | `#F75F8F`  | Pink                   |
| `#0F2E18` | `#62C073`  | Green                  |
| `#062822` | `#0AC7B4`  | Teal                   |

Default node color: `#1F1F1F` with `#EDEDED` text.

### Edge Style

Smooth-step path with an arrow marker. Default edge color: `#f8fafc`. Stroke width is thin — edges are visually secondary to nodes.

### Node Shapes

6 supported shapes, defined in `types/canvas.ts` as `NODE_SHAPES`. Complex shapes (diamond, hexagon, cylinder) are rendered as inline SVGs rather than CSS borders.

- `rectangle` — default general-purpose node
- `diamond` — decision / gateway
- `circle` — event / endpoint
- `pill` — service / process
- `cylinder` — database / storage
- `hexagon` — external system / boundary

### Connection Handles

Small white circular handles, hidden by default, revealed on node hover. Appear at all four sides of a node.

### Canvas Background

React Flow-style **dot grid** on `--bg-base`. Small, evenly spaced dots — not a line grid.

Placeholder canvases use `.canvas-dots` in `globals.css`:

- background: `--bg-base`
- dots: `color-mix` of `--text-primary` at 16% opacity, 1px
- gap: `20px` (React Flow `Background` default)
- position offset: `10px 10px`

When the live React Flow canvas lands, use `<Background variant="dots">` with the same gap and a token-based color so it matches `.canvas-dots`. Do not switch to `lines` or `cross`.

## Component Library

shadcn/ui on top of Tailwind. No custom design system. Components live in `components/ui/`. Use the `shadcn` CLI to add new components rather than writing them from scratch.

## Layout Patterns

- Editor workspace: full-bleed canvas on `--bg-base` under the transparent navbar. No inset gap, canvas border, or card radius around the flow surface.
- Sidebars: `absolute` overlay panels (`z-30`) with `rounded-2xl`, `bg-surface/95`, hairline `border-surface-border`, and `shadow-lg`. They float over the canvas and never shrink it. Closed state uses `translateX` fully off-screen (`calc(100% + 1.5rem)`), clipped by `overflow-hidden` on the workspace pane. Mobile adds a scrim behind the project sidebar.
- Canvas surface: edge-to-edge `bg-base` with the dot grid. Children must be `w-full h-full` flex columns so home/empty states stay centered — never a row flex that shrinks content to the left.
- Modals and dialogs: centered overlay, `rounded-3xl`, dark background with backdrop blur.

## Editor Chrome

This is the locked visual language for `/editor` and `/editor/[roomId]`. Later canvas, Liveblocks, and AI work must compose inside it — the navbar must not use a filled full-width background, and the canvas stays flush with the page background (Figma-style), not an inset card. Do not restore a full-bleed filled navbar bar, or replace the dot grid.

### Navbar

Transparent top bar (`h-14`), no bottom border, no `bg-surface` fill.

- Left: sidebar toggle, then project name (or `Omniarch` on home) with a `Workspace` subtitle in `text-copy-muted`.
- Right (workspace only): outline pill **Share**, solid cyan pill **AI** (`Sparkles` + label), then Clerk `UserButton`.
- Home hides Share and AI.

### Project sidebar

- Header: `Projects` + close.
- Segmented **My Projects** / **Shared** tabs. The selected tab follows the current room: a shared room opens **Shared**; an owned room opens **My Projects**. Manual tab changes persist until the room changes.
- Current room: cyan status dot + `bg-accent-dim` row. Rename and delete sit inside that same highlighted row (no separate chip). Unselected rows still reveal actions on hover.
- Footer pinned: full-width pill **New Project** (`rounded-full`, cyan). No compass mark.

### Home vs workspace

- `/editor` (home): both sidebars **closed**. Create-project copy and CTA are centered in the canvas panel.
- `/editor/[roomId]`: the project sidebar is **open** by default. The AI Copilot panel stays **closed** until the navbar AI button is clicked.

### AI Copilot panel

Right column, `w-80`, `rounded-2xl` surface.

- Header: `AI Copilot` + `Placeholder panel.` and a spark icon.
- Body card: robot icon, `Chat surface pending`.
- Footer card: `FUTURE HOOKS` label for prompt/spec work still out of scope.

Real chat later replaces the placeholder cards; keep the panel chrome.

## Icons

Lucide React. Stroke-based icons only — no filled variants. Icon sizes: `h-4 w-4` for inline, `h-5 w-5` for buttons, `h-8 w-8` for feature icons in empty states.
