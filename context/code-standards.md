# Code Standards

## General

- Keep modules small and single-purpose.
- Fix root causes — do not layer workarounds.
- Do not mix unrelated concerns in one component or route.
- Respect the system boundaries defined in `architecture-context.md`.

## The Core Philosophy

- YAGNI Principle: Embodies "You Aren't Gonna Need It" by aggressively stripping out unrequested abstractions, scaffolding, and boilerplate.
- Deletion over Addition: Favors deleting or simplifying code over building complex new modules
- Platform First: Checks native libraries, standard runtimes, and built-in browser/platform capabilities before writing custom components.
- Boring over Clever: Chooses straightforward, readable implementations instead of complex, clever design patterns.

## TypeScript

- Strict mode is required throughout the project.
- Avoid `any`; use explicit interfaces or narrowly scoped types.
- Validate unknown external input at system boundaries before trusting it.
- Use `interface` for object contracts.

## Next.js

- Default to React Server Components.
- Add `"use client"` only when the component needs browser interactivity, hooks, or real-time state.
- Keep route handlers focused on a single responsibility.
- Long-running work belongs in background tasks, not in request handlers.

## Styling

- Use CSS custom property tokens defined in `globals.css` — no raw Tailwind color classes like `zinc-*` or hardcoded hex values.
- Reference tokens through their Tailwind utility names: `bg-base`, `text-copy-primary`, `border-surface-border`, `text-brand`, `bg-accent-dim`, etc.
- Use Tailwind’s canonical class names. Do not write an arbitrary value when a scale class exists (`h-42` not `h-[168px]`; `w-full max-w-5xl` not `w-[min(100%,64rem)]`). Put styles on the element itself (`titleClassName` / `descriptionClassName`) instead of descendant hacks like `[&_[data-slot=…]]` or `**:data-[slot=…]` — Tailwind treats those as the same class and `suggestCanonicalClasses` will keep warning. Arbitrary values are only for sizes that have no equivalent on the scale.
- Maintain the radius scale in `ui-context.md`: `rounded-xl` for small UI, `rounded-2xl` for panels, `rounded-3xl` for modals, `rounded-full` for editor chrome CTAs (Share, AI, New Project).
- Canvas surfaces use `.canvas-dots` (or React Flow dots with the same 20px gap). Do not use a line grid.
- Follow `context/ui-context.md` for editor chrome. Do not fill the navbar, wrap the canvas in a floating card, or left-align home empty states.

## API Routes

- Validate and parse request input before any logic runs.
- Enforce auth and project ownership checks before any mutation.
- Return consistent, predictable response shapes.
- Keep route handlers thin — push complexity into shared modules or background tasks.
- Liveblocks auth denials return `{ error: "forbidden", reason }` so the client stops retrying.

## Liveblocks

- Import React hooks and providers from `@liveblocks/react/suspense`.
- Wrap collaborative UI in `ClientSideSuspense` and `react-error-boundary` `ErrorBoundary`.
- Keep room membership in Prisma; issue access tokens with `prepareSession` after `findAccessibleProjectForViewer`.
- Create rooms with `getOrCreateRoom` and private `defaultAccesses`.
- Park `#liveblocks-badge` and `.react-flow__attribution` off-canvas with `transform: translate(120vw, 120vh)` and `pointer-events: none`. Do not `display: none`.

## Data and Storage

- Project metadata and relationships belong in PostgreSQL via Prisma.
- Canvas snapshots and generated specs belong in Vercel Blob; Prisma stores only the blob URL reference.
- Do not store large generated content directly in the database.
- Task run records are first-class relational data — treat ownership and run IDs as verified before any token issuance.

## File Organization

- `lib/` — shared infrastructure: Prisma client, auth helpers, utilities.
- `trigger/` — all durable background tasks and AI workflows.
- `components/` — UI composition only; no business logic.
- `app/api/` — route handlers for auth, triggering, and persistence.
- Name files after the responsibility they contain, not the technology.
