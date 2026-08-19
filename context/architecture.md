# Architecture Context

## Stack

| Layer            | Technology                | Role                                                           |
| ---------------- | ------------------------- | -------------------------------------------------------------- |
| Framework        | Next.js 16 + TypeScript   | Full-stack app with server/client boundaries                   |
| UI               | Tailwind + shadcn/ui      | Component composition and styling                              |
| Auth             | Clerk                     | User identity; `auth.protect()` on protected pages/layouts     |
| Database         | Prisma + PostgreSQL       | Relational metadata: projects, collaborators, specs, task runs |
| Canvas           | Liveblocks + React Flow   | Real-time collaborative canvas, presence, and cursors          |
| Background tasks | Trigger.dev               | Durable AI generation workflows                                |
| LLM              | Gemini (`@ai-sdk/google`) | Design (and later spec) generation inside Trigger.dev tasks    |
| Artifact storage | Vercel Blob               | Canvas snapshots and generated Markdown specs                  |

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
- Liveblocks room tokens are issued only after verifying project membership. Access tokens (`prepareSession`) grant `FULL_ACCESS` to that room after Prisma owner/collaborator checks. Rooms are created with `getOrCreateRoom` and private `defaultAccesses`. `Project.id` is the Liveblocks room id. Editor home is `/editor`; opening a project uses `/editor/[roomId]`. Workspace access is checked server-side with `lib/project-access.ts` (Clerk `userId` plus primary email; owner or collaborator). Missing and unauthorized rooms render `AccessDenied`. The canvas client uses suspense Liveblocks hooks, `ClientSideSuspense`, `react-error-boundary`, and `@liveblocks/react-flow` `Cursors`. Editor visual chrome (overlay sidebars, full-bleed dot-grid canvas, AI Copilot panel) is defined in `context/ui-context.md` — canvas and AI features compose inside that shell.

## Starter System Designs

- Prebuilt templates are static canvas snapshots stored in the codebase.
- Templates are loaded into the active Liveblocks room when a user imports one.
- Import can occur on canvas creation or from within the editor at any time.
- Template data follows the same node/edge schema as user-created canvas content.
- Templates do not require a separate database record; they are resolved by template ID at import time.

## AI Generation Model

### Design Generation

- Input: user prompt, project context, and current canvas state (`readCanvasGraph`).
- Execution: Trigger.dev task `design-agent` (`trigger/design-agent.ts`).
- Model: Gemini 3.6 Flash via `@ai-sdk/google` and `GOOGLE_API_KEY`. `generateText` with canvas tools (`lib/design-canvas-tools.ts`); do not use `Output.object()` or OpenRouter.
- Output: node and edge updates written into the shared Liveblocks room `flow` storage as tools run. Status messages go to feed `ai-status-feed`. Ephemeral presence user `omniarch-ai` shows `cursor` and `thinking` until the run ends.

### Spec Generation

- Input: current canvas graph (nodes, edges), chat history from the AI Architect tab, and project context (roomId = projectId).
- Execution: durable background task via Trigger.dev (`generate-spec` task in `trigger/generate-spec.ts`).
- Model: Gemini 3.6 Flash via `@ai-sdk/google` (`GOOGLE_GENERATIVE_AI_API_KEY` / `GEMINI_API_KEY` / `GOOGLE_API_KEY`). Uses `generateText` with reasoning disabled and minimal thinking config.
- Processing flow:
  1. Task receives payload: `roomId`, `chatHistory`, `nodes`, `edges` (nodes/edges from client may be empty; task calls `readCanvasGraph(roomId)` to get live canvas state).
  2. Ensures Liveblocks room exists (`ensureLiveblocksRoom`).
  3. Publishes status updates to `ai-status-feed` Liveblocks feed: "Starting spec generation…", "Reading canvas graph…", "Generating technical specification…", "Saving technical specification…".
  4. Calls `readCanvasGraph(roomId)` to fetch current nodes and edges from Liveblocks storage.
  5. Constructs system prompt with structured Markdown specification format requirements (Overview, Architecture, Components, Data Flow, Interfaces, Infrastructure, Non-Functional Requirements, Assumptions & Constraints).
  6. Sends canvas graph (nodes + edges) and chat history to Gemini as JSON in the prompt.
  7. On success: uploads generated Markdown to Vercel Blob at `specs/{roomId}/{specId}.md` (private, no random suffix, overwrite allowed).
  8. Creates/upserts `ProjectSpec` record in Prisma with `specId`, `projectId` (roomId), and `filePath` (Blob URL).
  9. Publishes final status "Spec generation complete" to `ai-status-feed`.
  10. Returns task output: `{ roomId, specId, filePath, spec }`.
- Output: Markdown technical spec saved to Vercel Blob, metadata linked to project in Prisma via `ProjectSpec`.
- Realtime tracking: Client uses `@trigger.dev/react-hooks` `useRealtimeRun` with a 1-hour scoped public token (issued by `POST /api/ai/spec/token` after verifying `TaskRun` ownership) to subscribe to run status and receive completion/error events.
- Error handling: Task catches errors, publishes "Spec generation failed" to `ai-status-feed`, logs error, and throws `AbortTaskRunError` to mark the run as failed.

## Invariants

1. Request handlers do not run long-lived AI work — that belongs in background tasks.
2. Metadata and large generated artifacts are stored in separate layers.
3. Auth and ownership are enforced at every mutation boundary.
4. Client components are used only where browser interactivity or real-time state requires them.
5. The canvas schema must remain consistent between user-created content, imported templates, and AI-generated nodes/edges.
