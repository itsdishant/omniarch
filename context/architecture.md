# Architecture Context

## Stack

| Layer            | Technology              | Role                                                           |
| ---------------- | ----------------------- | -------------------------------------------------------------- |
| Framework        | Next.js 16 + TypeScript | Full-stack app with server/client boundaries                   |
| UI               | Tailwind + shadcn/ui    | Component composition and styling                              |
| Auth             | Clerk                   | User identity; `auth.protect()` on protected pages/layouts     |
| Database         | Prisma + PostgreSQL     | Relational metadata: projects, collaborators, specs, task runs |
| Canvas           | Liveblocks + React Flow | Real-time collaborative canvas, presence, and cursors          |
| Background tasks | Trigger.dev             | Durable AI generation workflows                                |
| Artifact storage | Vercel Blob             | Canvas snapshots and generated Markdown specs                  |

## System Boundaries

- `app/api` — Authenticated request handlers: input validation, ownership checks, task triggering, and persistence.
- `trigger` — Long-running background jobs: AI design generation and spec generation.
- `lib` — Shared infrastructure: Prisma client, access control helpers, and utilities.
- `components` — UI composition: canvas surfaces, sidebars, dialogs, and interactive elements.
- `prisma` — Database schema and migrations. Generated client lives in `generated/prisma`.
- `data` — Legacy local directory. Not used for new artifacts.

## Storage Model

- **Database**: metadata, ownership, relationships, and task run records.
- **Vercel Blob**: generated artifacts — canvas snapshots at `canvas/{projectId}.json` and specs at `specs/{projectId}/{specId}.md`.
- Project records, spec records, and task run records belong in PostgreSQL.
- Canvas content and Markdown output are stored in and retrieved from Vercel Blob.
- The blob URL is stored in the database (`canvasJsonPath`, `filePath`) as the reference to the artifact.

## Auth and Collaboration Model

- Every project has a single owner (Clerk user ID).
- Projects can include additional collaborators.
- Only authenticated users can access protected routes. `clerkMiddleware()` stays in `proxy.ts` for Clerk; auth checks live on each protected page, layout, and server function via `auth.protect()`. API routes return `401` when unauthenticated. Sign-in and sign-up are public.
- Only the project owner can mutate a project record. Collaborators have read access and canvas access. The current project REST APIs are owner-scoped: `GET`/`POST /api/projects` and `PATCH`/`DELETE /api/projects/[projectId]`. Non-owner mutations return `403`. Collaborator list is `GET /api/projects/[projectId]/collaborators` for members; invite is `POST` and remove is `DELETE /api/projects/[projectId]/collaborators/[collaboratorId]`, both owner-only. Collaborators are stored by email on `ProjectCollaborator`. Display names and avatars are loaded from the Clerk Backend API at read time — there is no local user table.
- Liveblocks room tokens are issued only after verifying project membership. `Project.id` is the Liveblocks room id. Editor home is `/editor`; opening a project uses `/editor/[roomId]`. Workspace access is checked server-side with `lib/project-access.ts` (Clerk `userId` plus primary email; owner or collaborator). Missing and unauthorized rooms render `AccessDenied`. Editor visual chrome (inset panels, navbar, dot-grid canvas, AI Copilot column) is defined in `context/ui-context.md` — canvas and AI features compose inside that shell.

## Starter System Designs

- Prebuilt templates are static canvas snapshots stored in the codebase.
- Templates are loaded into the active Liveblocks room when a user imports one.
- Import can occur on canvas creation or from within the editor at any time.
- Template data follows the same node/edge schema as user-created canvas content.
- Templates do not require a separate database record; they are resolved by template ID at import time.

## AI Generation Model

### Design Generation

- Input: user prompt, project context, and current canvas state.
- Execution: durable background task via Trigger.dev.
- Output: structured node and edge updates written into the shared Liveblocks room.

### Spec Generation

- Input: current canvas graph and project context.
- Execution: durable background task via Trigger.dev.
- Output: Markdown technical spec saved to the filesystem and linked to the project in the database.

## Invariants

1. Request handlers do not run long-lived AI work — that belongs in background tasks.
2. Metadata and large generated artifacts are stored in separate layers.
3. Auth and ownership are enforced at every mutation boundary.
4. Client components are used only where browser interactivity or real-time state requires them.
5. The canvas schema must remain consistent between user-created content and imported templates.
