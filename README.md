# OmniArch

OmniArch is a real-time collaborative system design workspace. Users describe a system in plain English, an AI agent maps that system onto a shared canvas, collaborators refine the architecture, and the app generates a technical specification from the resulting graph.

## Features

- **Authentication & Projects** — Clerk-based auth with project ownership and collaborator access
- **Real-time Collaborative Canvas** — Liveblocks + React Flow with live cursors, presence, and node/edge editing
- **Starter System Designs** — Prebuilt templates (microservices, event-driven, CI/CD, etc.)
- **AI Architecture Generation** — Gemini 3.6 Flash generates nodes/edges from natural language prompts
- **AI Spec Generation** — Converts canvas graph + chat history into a Markdown technical specification
- **Spec Persistence & Download** — Vercel Blob storage with Prisma metadata, protected downloads
- **Canvas Autosave** — Debounced saves to Vercel Blob with status indicators

## Tech Stack

| Layer            | Technology                |
| ---------------- | ------------------------- |
| Framework        | Next.js 16 + TypeScript   |
| UI               | Tailwind + shadcn/ui      |
| Auth             | Clerk                     |
| Database         | Prisma + PostgreSQL       |
| Canvas           | Liveblocks + React Flow   |
| Background Tasks | Trigger.dev               |
| LLM              | Gemini (`@ai-sdk/google`) |
| Artifact Storage | Vercel Blob               |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Clerk account
- Trigger.dev account
- Vercel Blob store
- Google AI API key (Gemini)

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Trigger.dev
TRIGGER_SECRET_KEY="tr_..."
TRIGGER_API_URL="https://api.trigger.dev"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# Google AI (Gemini)
GOOGLE_GENERATIVE_AI_API_KEY="..."
```

### Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prebuild

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run prebuild     # Generate Prisma client
npx prettier --write .  # Format code
```

## Architecture

```
app/
├── api/                    # API routes (auth, projects, specs, liveblocks)
├── editor/                 # Editor pages (home, workspace)
├── sign-in/                # Clerk sign-in
└── sign-up/                # Clerk sign-up

components/
├── editor/                 # Canvas, AI sidebar, shapes, templates
└── ui/                     # shadcn/ui components

lib/
├── prisma.ts               # Prisma client
├── projects.ts             # Project CRUD + blob cleanup
├── canvas-flow.ts          # Liveblocks canvas read/write
├── task-runs.ts            # Trigger.dev task run tracking
└── ai-status.ts            # AI status feed

trigger/
├── design-agent.ts         # AI architecture generation
├── generate-spec.ts        # AI spec generation
└── cleanup-blobs.ts        # Durable blob cleanup with retries

hooks/
├── use-spec-generation-run.ts
├── use-design-agent-run.ts
└── use-ai-chat.ts

prisma/
├── schema.prisma           # Generator + datasource
└── models/
    ├── project.prisma      # Project, ProjectCollaborator, ProjectSpec
    └── task-run.prisma     # TaskRun

context/
├── project-overview.md     # Product definition
├── architecture.md         # System architecture
├── ui-context.md           # Design system
├── code-standards.md       # Implementation rules
├── ai-workflow-rules.md    # Development workflow
└── progress-tracker.md     # Implementation progress
```

## Key Flows

### Spec Generation

1. User clicks "Generate spec" in AI sidebar → `POST /api/ai/spec`
2. Server validates, triggers `generate-spec` Trigger.dev task, returns `runId` + public token
3. Client tracks run via `useRealtimeRun` hook
4. Task reads live canvas, generates Markdown via Gemini, uploads to Vercel Blob
5. Task creates `ProjectSpec` record, enqueues cleanup **only on failure**
6. On completion: spec list refreshes, user can preview/download

### Project Deletion

1. Fetch blob URLs (canvas + specs)
2. Delete project (cascade removes specs, collaborators, task runs)
3. Enqueue `cleanup-blobs` task for fetched URLs
4. If enqueue fails: blobs remain but project is gone (retriable)

## Security & Reliability

- **Prompt bounds**: Max 200 nodes, 300 edges, 200-char labels, 100k total prompt chars
- **Chat history bounds**: Max 50 messages, 8k chars per message
- **Race condition guard**: Synchronous ref prevents duplicate spec generation
- **Durable cleanup**: Trigger.dev task with exponential backoff (5 attempts, up to 1 hour)
- **Blob lifecycle**: Cleanup only on failure (generation) or after success (deletion)
- **Access control**: All API routes verify project ownership/collaboration
