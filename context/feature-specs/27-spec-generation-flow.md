# Spec Generation Flow

Create the backend flow for AI-powered spec generation: API route, Trigger.dev
task, token route, and run ownership tracking.

## Implementation

1. Spec trigger route (`POST /api/ai/spec`)

   Create or update `POST /api/ai/spec` in `app/api/ai/spec/route.ts`.

   It should:

   - Accept `roomId`, `chatHistory`, `nodes`, and `edges` in the request body
   - Authenticate the current user via Clerk (`auth()`)
   - Parse and validate the payload using `specGenerationPayloadSchema` (Zod) from `types/spec.ts`
   - Resolve the current user's Clerk identity via `getCurrentClerkIdentity()`
   - Resolve project access from `roomId` using `findAccessibleProjectForViewer(roomId, identity)` — this verifies the user is either the owner or a collaborator
   - Verify that `roomId === project.id` (the room ID must match the project ID)
   - Trigger the `generate-spec` Trigger.dev task via `tasks.trigger<typeof generateSpecTask>("generate-spec", { roomId: project.id, chatHistory, nodes, edges })`
   - Save a `TaskRun` record via `createTaskRun({ runId: handle.id, projectId: project.id, userId })` for ownership/access control
   - Create a Trigger.dev public access token scoped to `read.runs[handle.id]` using `triggerAuth.createPublicToken()`
   - Return `{ runId: handle.id, publicToken }` to the client

   **Important**: Do not trust a client-supplied `projectId`. The project is derived from `roomId` via `findAccessibleProjectForViewer`.

   **Payload validation** (`specGenerationPayloadSchema`):
   - `roomId`: string (min 1)
   - `chatHistory`: array of `ChatMessage` objects (`{ role: "user" | "assistant", content: string, timestamp: number }`)
   - `nodes`: array of `CanvasNode` objects (can be empty — task reads live canvas)
   - `edges`: array of `CanvasEdge` objects (can be empty — task reads live canvas)

1. Spec token route (`POST /api/ai/spec/token`)

   Create or update `POST /api/ai/spec/token` in `app/api/ai/spec/token/route.ts`.

   It should:

   - Accept `runId` in the request body
   - Authenticate the current user via Clerk (`auth()`)
   - Parse the request body and extract `runId` using `readRequiredRunId()`
   - Verify the `TaskRun` belongs to the user via `findOwnedTaskRun(runId, userId)` — returns the task run if the user owns it
   - If not found, return `403 Forbidden`
   - Issue a Trigger.dev public access token via `triggerAuth.createPublicToken()` with scopes: `{ read: { runs: [runId] } }` and `expirationTime: "1h"`
   - Return `{ token }` to the client

   This token is used by the frontend `useRealtimeRun` hook to subscribe to the run's real-time status.

1. Spec generation task (`trigger/generate-spec.ts`)

   Create or update `trigger/generate-spec.ts`. Define a `generateSpecTask` using `task({ id: "generate-spec", retry: { maxAttempts: 1 }, run: async (payload) => { ... } })`.

   The task should:

   - Accept payload validated by `specGenerationPayloadSchema` (Zod inferred type)
   - Destructure: `roomId`, `chatHistory`, `nodes`, `edges` (note: `nodes` and `edges` from client may be empty arrays)
   - Log start: `logger.log("Spec generation started", { roomId, nodeCount: nodes.length, edgeCount: edges.length })`
   - Call `ensureLiveblocksRoom(roomId)` to ensure the room exists
   - Publish status to `ai-status-feed`: "Starting spec generation…"
   - Publish status: "Reading canvas graph…"
   - Call `readCanvasGraph(roomId)` from `lib/canvas-flow.ts` to fetch the live canvas nodes and edges from Liveblocks storage (this is the source of truth, not the client-provided arrays)
   - Publish status: "Generating technical specification…"
   - Initialize Gemini client via `googleClient()` helper:
     - Reads API key from `GOOGLE_GENERATIVE_AI_API_KEY` || `GEMINI_API_KEY` || `GOOGLE_API_KEY`
     - Throws `AbortTaskRunError` if no key is configured
     - Returns `createGoogleGenerativeAI({ apiKey })`
   - Call `generateText()` with:
     - Model: `googleClient()("gemini-3.6-flash")`
     - `reasoning: "none"`
     - Provider options: `{ google: { thinkingConfig: { thinkingLevel: "minimal", includeThoughts: false } } }`
     - System prompt: Detailed instructions for generating a technical specification in Markdown with sections: Overview, Architecture, Components, Data Flow, Interfaces, Infrastructure, Non-Functional Requirements, Assumptions & Constraints
     - Prompt: JSON stringified `{ nodes: graph.nodes, edges: graph.edges }` and `chatHistory`
   - Publish status: "Saving technical specification…"
   - Generate `specId = crypto.randomUUID()`
   - Upload Markdown to Vercel Blob: `put(\`specs/${roomId}/${specId}.md\`, result.text, { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: "text/markdown; charset=utf-8", cacheControlMaxAge: 60 })`
   - Upsert `ProjectSpec` in Prisma: `prisma.projectSpec.upsert({ where: { id: specId }, create: { id: specId, projectId: roomId, filePath: blob.url }, update: { filePath: blob.url } })`
   - Publish status: "Spec generation complete"
   - Log completion: `logger.log("Spec generation finished", { roomId, ms: Date.now() - startedAt, usage: result.usage, summaryLength: result.text.length })`
   - Return task output: `{ roomId, specId, filePath: blob.url, spec: result.text }`
   - Error handling: Catch errors, publish "Spec generation failed" to `ai-status-feed`, log error, throw `AbortTaskRunError(message)`

## Scope Limits

- Do not add frontend logic
- Do not create spec editor UI
- Do not store the final spec content in this unit (handled in 28-spec-persistence-download)
- Do not derive access from client-provided project IDs
- Do not create a new AI provider abstraction
- Do not change existing canvas or chat data models

## Notes

- Check `context/project-overview.md` and `context/architecture.md` for system alignment before implementing
- Use Zod for request/task input validation (`specGenerationPayloadSchema` in `types/spec.ts`)
- Use Prisma for `TaskRun` persistence (`createTaskRun`, `findOwnedTaskRun` in `lib/task-runs.ts`)
- Project access must come from the authenticated user + `roomId`
- Keep the task output as plain Markdown
- Reuse existing auth, Prisma, Trigger.dev, and Gemini patterns
- The `nodes` and `edges` in the trigger payload can be empty — the task reads the live canvas via `readCanvasGraph`
- Realtime status updates use the `ai-status-feed` Liveblocks feed (same feed used by design agent)

## Check When Done

- `POST /api/ai/spec` validates input and returns a `runId`
- A `TaskRun` record is created for the authenticated user
- `POST /api/ai/spec/token` only returns a token for the run owner
- `generate-spec` runs through Trigger.dev and returns Markdown output
- Task reads live canvas via `readCanvasGraph`, not client-provided nodes/edges
- Status updates published to `ai-status-feed` during generation
- Spec uploaded to Vercel Blob and `ProjectSpec` record created
- TypeScript and build pass
