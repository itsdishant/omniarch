<div align="center">
  <a href="https://github.com/itsdishant/omniarch" target="_blank">
    <img src="context/screenshots/omniarch-editor-screen.png" alt="OmniArch Workspace Screenshot" width="100%" style="border-radius: 12px; max-height: 500px; object-fit: cover;" />
  </a>
  <br /><br />

  <div>
    <img src="https://img.shields.io/badge/-Next.js_16-000000?style=for-the-badge&logo=Next.js&logoColor=white" />
    <img src="https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=Tailwind%20CSS&logoColor=white" />
    <img src="https://img.shields.io/badge/-shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" />
    <img src="https://img.shields.io/badge/-Liveblocks-000000?style=for-the-badge&logo=liveblocks&logoColor=white" />
    <br />
    <img src="https://img.shields.io/badge/-React_Flow-FF0072?style=for-the-badge&logo=reactflow&logoColor=white" />
    <img src="https://img.shields.io/badge/-Google_Gemini_3.6_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" />
    <img src="https://img.shields.io/badge/-Trigger.dev_v4-0B0F19?style=for-the-badge" />
    <img src="https://img.shields.io/badge/-Prisma_ORM-2D3748?style=for-the-badge&logo=Prisma&logoColor=white" />
    <img src="https://img.shields.io/badge/-PostgreSQL-4169E1?style=for-the-badge&logo=PostgreSQL&logoColor=white" />
    <img src="https://img.shields.io/badge/-Clerk_Auth-6C47FF?style=for-the-badge&logo=Clerk&logoColor=white" />
    <img src="https://img.shields.io/badge/-Vercel_Blob-000000?style=for-the-badge&logo=Vercel&logoColor=white" />
  </div>

  <h3 align="center">OmniArch | Real-Time Collaborative AI System Design Saas Workspace</h3>

  <div align="center">
    Architect, visualize, and document distributed software systems in real time with an agentic AI partner, collaborative canvas, and automated technical specification generation.
  </div>
</div>

## 📋 <a name="table">Table of Contents</a>

1. ✨ [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 🤸 [Quick Start](#quick-start)
5. 🏗️ [System Architecture & Flows](#system-architecture)
6. 🛡️ [Security & Reliability](#security-and-reliability)
7. 📜 [Project Structure](#project-structure)

## <a name="introduction">✨ Introduction</a>

**OmniArch** is an intelligent, real-time collaborative system design workspace tailored for modern engineering teams. It transforms abstract architectural ideation into structured, production-ready system graphs and technical specifications.

Instead of wrestling with static diagramming tools or fragmented whiteboards, engineers describe distributed systems in natural language. Powered by **Google Gemini 3.6 Flash** and durable **Trigger.dev** background workflows, the AI Architect dynamically creates, positions, styles, and links components on a synchronized canvas. Simultaneously, collaborators can interact live with real-time multi-user presence, cursors, custom architectural shapes, and starter blueprints powered by **Liveblocks** and **React Flow**.

Once the architecture is finalized, OmniArch synthesizes the graph topology and team chat history into an enterprise-grade Markdown **Technical Specification document** (including data flows, component boundaries, failure modes, and infrastructure recommendations), safely persisted on **Vercel Blob** with in-app preview and protected downloads.

## <a name="tech-stack">⚙️ Tech Stack</a>

- **[Next.js 16](https://nextjs.org/)** — Full-stack React framework utilizing the App Router, React Server Components, Server Actions, and high-performance API route handlers.
- **[TypeScript](https://www.typescriptlang.org/)** — Strict, end-to-end type safety spanning database models, Zod runtime validation, Liveblocks storage structures, and React Flow nodes.
- **[Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)** — Modern design system customized with dark-mode CSS tokens, Radix UI primitives, Lucide icons, and responsive layouts.
- **[Liveblocks](https://liveblocks.io/)** — Real-time collaboration infrastructure managing distributed state (CRDTs), live multi-user cursors, presence awareness, and broadcast status feeds.
- **[React Flow (@xyflow/react)](https://reactflow.dev/)** — Interactive canvas engine customized with smooth step paths, midpoint edge labels, custom draggable architectural shapes, and interactive node toolbars.
- **[Google Gemini 3.6 Flash](https://ai.google.dev/) (`@ai-sdk/google`)** — State-of-the-art multimodal LLM powering agentic graph tool execution (`addNode`, `moveNode`, `addEdge`, etc.) and structured technical specification synthesis.
- **[Trigger.dev v4](https://trigger.dev/)** — Resilient background task orchestration engine handling long-running AI design agent tasks, spec generation, and durable exponential-backoff blob cleanup.
- **[Prisma ORM](https://www.prisma.io/) & [PostgreSQL](https://www.postgresql.org/)** — Multi-file database schema modeling projects, collaborator roles, task executions, and specification metadata with connection caching.
- **[Clerk](https://clerk.com/)** — Enterprise-grade authentication and user management with dark theme styling, protected routes, and backend user enrichment.
- **[Vercel Blob](https://vercel.com/docs/storage/vercel-blob)** — Secure, private cloud asset storage for serialized canvas autosaves and generated Markdown technical specifications.

## <a name="features">🔋 Features</a>

👉 **Real-Time Collaborative Canvas**: Full-duplex synchronization powered by Liveblocks and React Flow. See teammates' live cursors, participant avatars, selection states, and thinking indicators on a full-bleed dot-grid canvas.

👉 **Natural Language AI Architect**: Describe requirements in plain English (e.g., _"Design an event-driven payment processing system with Kafka and dead-letter queues"_). The AI design agent executes atomic canvas tools to add, position, connect, and style nodes in real time.

👉 **Automated Technical Spec Generation**: Convert the visual system architecture and chat context into comprehensive, structured Markdown technical specifications with Overview, Component Architecture, Data Flow, Interfaces, Infrastructure, and NFRs.

👉 **Interactive Shape Palette**: Drag-and-drop specialized architecture primitives onto the canvas, including Rectangles, Diamonds, Circles, Pills, Cylinders, and Hexagons with automatic coordinate mapping.

👉 **Node Styling & Edge Routing**: Floating swatch toolbar offering 8 curated color pairs for nodes, alongside four-directional handles, smooth step connections, and midpoint edge label editing.

👉 **Prebuilt System Design Templates**: Kickstart architecture reviews with one-click blueprints for Microservices, Event-Driven Architectures, CI/CD Pipelines, and more.

👉 **In-App Spec Preview & Protected Download**: Inspect generated specs directly inside the AI sidebar using a rich Markdown preview modal with syntax highlighting, or download protected Markdown attachments natively.

👉 **Debounced Canvas Autosave**: Canvas graph snapshots are automatically serialized and saved to private Vercel Blob storage in the background with navbar save-status indicators (`Saving...`, `Saved`, `Error`).

👉 **Project & Collaborator Management**: Create, rename, delete, and organize project workspaces. Invite teammates by email with Clerk-enriched profiles and owner-guarded permissions.

👉 **Ergonomic Canvas Controls**: Built-in zoom in/out, fit-to-view, undo/redo history controls, and keyboard shortcut integrations for a distraction-free workflow.

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up and run OmniArch locally on your machine.

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v20.0.0 or higher)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- [PostgreSQL](https://www.postgresql.org/) database instance
- Accounts with [Clerk](https://clerk.com/), [Liveblocks](https://liveblocks.io/), [Trigger.dev](https://trigger.dev/), [Vercel Blob](https://vercel.com/), and [Google AI Studio](https://aistudio.google.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/itsdishant/omniarch.git
cd omniarch
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Configure Environment Variables

Create a `.env` (or `.env.local`) file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# PostgreSQL & Prisma
DATABASE_URL="postgresql://user:password@localhost:5432/omniarch?sslmode=prefer"

# Liveblocks Realtime Engine
LIVEBLOCKS_SECRET_KEY=sk_dev_...

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# Trigger.dev Background Tasks
TRIGGER_PROJECT_REF=proj_...
TRIGGER_SECRET_KEY=tr_dev_...
TRIGGER_API_URL=https://api.trigger.dev

# Google Gemini API
GOOGLE_API_KEY=AIzaSy...
```

---

### 4. Database Setup & Prisma Generation

Generate the Prisma Client and apply migrations to your PostgreSQL database:

```bash
# Generate Prisma Client delegates
npm run prebuild

# Push database schema or run migrations
npx prisma migrate dev --name init
```

---

### 5. Run the Application

Start both the Next.js development server and the Trigger.dev background worker:

```bash
# Terminal 1: Next.js dev server
npm run dev

# Terminal 2: Trigger.dev background task runner
npm run dev:trigger
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Available Scripts

| Command                  | Description                                               |
| :----------------------- | :-------------------------------------------------------- |
| `npm run dev`            | Starts the Next.js development server at `localhost:3000` |
| `npm run dev:trigger`    | Starts the local Trigger.dev task execution worker        |
| `npm run build`          | Builds the Next.js application for production             |
| `npm run prebuild`       | Synchronizes and generates the Prisma Client delegates    |
| `npm run lint`           | Runs Next.js ESLint verification                          |
| `npm run deploy:trigger` | Deploys background tasks to Trigger.dev cloud             |

<br />

## <a name="system-architecture">🏗️ System Architecture & Flows</a>

```
omniarch/
├── app/                        # Next.js App Router (Pages, Layouts & API routes)
│   ├── (auth)/                 # Clerk sign-in / sign-up auth flows
│   ├── api/                    # Authenticated REST endpoints (Projects, Specs, Liveblocks)
│   └── editor/                 # Collaborative Editor home & [roomId] workspace
├── components/                 # React UI Component Library
│   ├── editor/                 # Canvas wrapper, custom shapes, controls & AI sidebar
│   └── ui/                     # Reusable shadcn/ui components
├── hook/ & hooks/              # Custom React hooks (Liveblocks, Autosave, Realtime runs)
├── lib/                        # Shared server utilities, Prisma client & access control
├── prisma/                     # Multi-file schema definitions (Projects, Specs, TaskRuns)
├── trigger/                    # Trigger.dev background task definitions
│   ├── design-agent.ts         # Agentic graph builder via Gemini tool calls
│   ├── generate-spec.ts        # Markdown technical specification generator
│   └── cleanup-blobs.ts        # Durable exponential backoff blob cleanup task
└── types/                      # TypeScript schemas & Zod definitions (Canvas, Specs, Tasks)
```

### Key Operational Flows

#### 1. AI Architecture Generation Flow

1. User submits an architecture prompt in the AI Workspace sidebar.
2. `POST /api/ai/design` validates project access, records a `TaskRun`, and triggers the `design-agent` task on Trigger.dev.
3. The client subscribes to real-time execution via `@trigger.dev/react-hooks` with a scoped public token.
4. Gemini 3.6 Flash evaluates the prompt, invokes atomic tools (`addNode`, `moveNode`, `addEdge`), and mutates the Liveblocks `flow` storage directly.
5. Ephemeral AI cursor presence and status updates stream to all active room participants.

#### 2. Technical Specification Generation Flow

1. User clicks **Generate Spec** in the Specs tab.
2. `POST /api/ai/spec` initiates the durable `generate-spec` background task.
3. The worker queries the live canvas graph directly from Liveblocks storage and formats prompt context with token safety bounds.
4. Gemini generates a structured, multi-section Markdown specification.
5. The generated file is uploaded to private Vercel Blob storage, metadata is recorded in Prisma `ProjectSpec`, and collaborators receive instant UI updates to preview or download.

#### 3. Resilient Blob Lifecycle & Cleanup Flow

1. When a project is deleted, active canvas and spec blob URLs are cataloged before DB cascade deletion.
2. The `cleanup-blobs` Trigger.dev task executes with exponential backoff (5 retries over 1 hour) to guarantee zero orphaned storage artifacts.

## <a name="security-and-reliability">🛡️ Security & Reliability</a>

- **Bounded LLM Context Limits**: Canvas graph serialization enforces strict safety caps (maximum 200 nodes, 300 edges, 200-character labels, and 100k total prompt characters) to prevent context overflows and token cost spikes.
- **Race Condition Prevention**: Synchronous execution refs (`startingRef`) prevent duplicate generation runs from simultaneous user triggers.
- **Multi-Tenant Access Isolation**: Every API endpoint and Liveblocks session token strictly enforces project ownership or collaborator email verification through Prisma before granting read/write capabilities.
- **Fault-Tolerant Storage Cleanup**: Blob storage cleanups only execute on database failures or post-deletion confirmations, ensuring active production artifacts are never mistakenly deleted.
