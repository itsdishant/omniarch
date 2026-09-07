# Graph Report - omniarch  (2026-09-05)

## Corpus Check

- 171 files · ~76,991 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 791 nodes · 1458 edges · 76 communities (33 shown, 37 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 50 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)

- Backend API Routes
- Design Agent & Spec Pipelines
- Linting & Build DevDependencies
- Canvas Interaction & Styling Specs
- Editor Workspace Shell & Chrome
- System Blueprints & Integration Specs
- Playwright E2E Test Suite
- TypeScript Compiler & Path Config
- Live AI Architect Chat Panel
- Canvas Edge & Connection System
- Shadcn Component Aliases & Config
- AI Sidebar View & Tabs
- Editor Navigation & Liveblocks Room
- Canvas Controls & Zoom UI
- Project Dialogs & Editor Home
- Architecture Starter Templates
- Share Dialog & Collaborator Management
- Canvas Shape Node Component
- Project Sidebar & Listing
- Canvas Shape Drag Palette
- System Architecture & Invariants
- Canvas Keyboard Shortcuts & Interactions
- AI & Cloud Provider Dependencies
- Geometric Canvas Shape Primitives
- UI Layout & Canvas Screenshot
- Architecture Spec Generation UI
- Collaboration Sharing Modal UI
- Root Layout & Typography
- Authentication Pages & Split Layout
- Code Standards & Engineering Guidelines
- Canvas Data Validation Utilities
- Agent Rules & Development Context
- Editor Route Protection & Redirect
- Canvas Node & Edge Editing Specs
- AI Workspace Sidebar Tabs Spec
- Next.js Configuration
- Class Variance Authority Library
- Clerk Authentication Library
- Clerk UI Library
- Clsx Class Utility Library
- Canvas Toolbar & Shortcuts Spec
- Technical Dark Theme Tokens Spec
- Dotenv Environment Library
- ESLint Configuration
- Liveblocks Client Library
- Liveblocks React Integration Library
- Liveblocks React Flow Library
- Liveblocks UI Library
- Lucide React Icons
- Next.js Framework Core
- Node PostgreSQL Driver
- Prisma PostgreSQL Adapter
- Prisma Client ORM
- Prisma Accelerate Extension
- Radix UI Primitives
- React DOM Library
- React Error Boundary
- React Markdown Renderer
- Shadcn CLI Tooling
- Tailwind Merge Utility
- Trigger.dev React Hooks
- Trigger.dev SDK
- Tailwind Animate CSS
- Vercel Blob Storage
- XYFlow React Flow Library
- Zod Schema Validation
- PostCSS Configuration
- Network Proxy Configuration
- TypeScript and Next.js Standards
- Issue Tracking & Bugs

## God Nodes (most connected - your core abstractions)

1. `cn()` - 46 edges
2. `createAndSignInTestUser()` - 29 edges
3. `parseJsonBody()` - 19 edges
4. `findAccessibleProjectForViewer()` - 18 edges
5. `createTestProject()` - 18 edges
6. `getCurrentClerkIdentity()` - 17 edges
7. `compilerOptions` - 16 edges
8. `CanvasNode` - 16 edges
9. `CanvasEdge` - 16 edges
10. `getLiveblocksClient()` - 12 edges

## Surprising Connections (you probably didn't know these)

- `Claude Assistant Context and Guidelines` --semantically_similar_to--> `Context Documentation Reading Order`  [INFERRED] [semantically similar]
  CLAUDE.md → AGENTS.md
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `AiSidebarView()` --calls--> `cn()`  [EXTRACTED]
  components/editor/ai-sidebar.tsx → lib/utils.ts
- `RoleBadge()` --calls--> `cn()`  [EXTRACTED]
  components/editor/share-dialog.tsx → lib/utils.ts
- `DialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dialog.tsx → lib/utils.ts

## Import Cycles

- None detected.

## Hyperedges (group relationships)

- **Project Access and Multi-Tenant Authorization** — context_architecture_auth_collaboration, context_feature_specs_08_editor_workspace_shell_access_guard, context_feature_specs_10_liveblocks_setup_auth_route, context_feature_specs_06_project_apis_access_control [INFERRED 0.95]
- **Canvas Node Lifecycle and Shape Pipeline** — context_feature_specs_11_base_canvas_wrapper, context_feature_specs_12_shape_panel_drag_drop, context_feature_specs_13_node_shape_rendering, context_feature_specs_13_node_shape_ghost_preview [INFERRED 0.95]
- **Editor Workspace Shell Composition** — context_feature_specs_02_editor_navbar, context_feature_specs_02_editor_sidebar, context_feature_specs_08_editor_workspace_shell_layout, context_feature_specs_11_base_canvas_wrapper [INFERRED 0.95]
- **Spec Generation Pipeline** — context_feature_specs_27_spec_generation_flow_generate_spec_task, context_feature_specs_28_spec_persistence_download_project_spec_model, context_feature_specs_28_spec_persistence_download_spec_download_route, context_feature_specs_29_spec_ui_integration_use_spec_generation_run, context_feature_specs_29_spec_ui_integration_spec_preview_dialog [EXTRACTED 1.00]
- **AI Architecture Design Pipeline** — context_feature_specs_22_design_agent_api_design_trigger_route, context_feature_specs_22_design_agent_api_design_task, context_feature_specs_23_design_agent_logic_gemini_design_tools, context_feature_specs_26_design_agent_frontend_realtime_run_tracking, context_feature_specs_24_ai_presence_state_ai_status_feed [EXTRACTED 1.00]
- **Canvas Direct Manipulation and Ergonomics System** — context_feature_specs_14_node_editing_node_resizing, context_feature_specs_14_node_editing_inline_label_editing, context_feature_specs_15_nodes_color_toolbar_color_toolbar, context_feature_specs_16_edge_behavior_custom_edge_renderer, context_feature_specs_17_canvas_ergonomics_floating_control_bar [EXTRACTED 1.00]
- **OmniArch Editor Layout Components** — context_screenshots_omniarch_editor_screen_top_navbar, context_screenshots_omniarch_editor_screen_projects_sidebar, context_screenshots_omniarch_editor_screen_canvas_workspace, context_screenshots_omniarch_editor_screen_ai_workspace_panel [EXTRACTED 1.00]
- **Diagramming Canvas and Tools** — context_screenshots_omniarch_editor_screen_canvas_workspace, context_screenshots_omniarch_editor_screen_shape_toolbar, context_screenshots_omniarch_editor_screen_architecture_nodes, context_screenshots_omniarch_editor_screen_connection_edges [EXTRACTED 1.00]

## Communities (76 total, 37 thin omitted)

### Community 0 - "Backend API Routes"

Cohesion: 0.06
Nodes (71): POST(), POST(), POST(), POST(), GET(), getAccessibleProject(), PUT(), DELETE() (+63 more)

### Community 1 - "Design Agent & Spec Pipelines"

Cohesion: 0.07
Nodes (52): forbiddenResponse(), POST(), DesignRunHandle, SpecRunHandle, AI_AGENT_USER_ID, AI_USER_INFO, clearAiPresence(), updateAiPresence() (+44 more)

### Community 2 - "Linting & Build DevDependencies"

Cohesion: 0.04
Nodes (45): @clerk/eslint-plugin, @clerk/testing, eslint, eslint-config-next, devDependencies, @clerk/eslint-plugin, @clerk/testing, eslint (+37 more)

### Community 3 - "Canvas Interaction & Styling Specs"

Cohesion: 0.06
Nodes (40): Canvas Node Resizing, Node Color Toolbar, Predefined Color Palette Pairs, Starter Template Library, Starter Templates Modal, Live Canvas Cursors, Canvas Collaborator Avatars Group, useCanvasAutosave Hook (+32 more)

### Community 4 - "Editor Workspace Shell & Chrome"

Cohesion: 0.08
Nodes (30): AiSidebar(), EditorShellChrome(), EditorShellChromeProps, EditorShellProps, EditorWorkspacePane(), EditorWorkspacePaneProps, ProjectDialogsContext, ProjectDialogsProvider() (+22 more)

### Community 5 - "System Blueprints & Integration Specs"

Cohesion: 0.06
Nodes (39): Auth and Collaboration Model, Starter System Design Blueprints, API Route Implementation Standards, Liveblocks Integration Conventions, Editor Navigation Bar, Floating Project Sidebar, Editor Base Chrome Specification, Clerk Auth Proxy and Route Protection (+31 more)

### Community 6 - "Playwright E2E Test Suite"

Cohesion: 0.12
Nodes (5): createAndSignInTestUser(), createTestProject(), DEFAULT_E2E_EMAIL, DEFAULT_E2E_PASSWORD, TestUserCredentials

### Community 7 - "TypeScript Compiler & Path Config"

Cohesion: 0.07
Nodes (29): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+21 more)

### Community 8 - "Live AI Architect Chat Panel"

Cohesion: 0.13
Nodes (20): AiSidebarLive(), ArchitectChatLive(), ArchitectChatPanel(), handleKeyDown(), postError(), submit(), formatChatTime(), AiChatFeedItem (+12 more)

### Community 9 - "Canvas Edge & Connection System"

Cohesion: 0.13
Nodes (15): CanvasEdgeComponent(), EdgeActionsContext, sanitizeEdgeLabel(), canvasEdgeTypes, CanvasWrapper(), CanvasWrapperProps, defaultEdgeOptions, CanvasEdgeData (+7 more)

### Community 10 - "Shadcn Component Aliases & Config"

Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 11 - "AI Sidebar View & Tabs"

Cohesion: 0.17
Nodes (14): AiSidebarProps, AiSidebarView(), markdownComponents, ProjectSpecSummary, starterPrompts, DialogPatternProps, Dialog(), DialogClose() (+6 more)

### Community 12 - "Editor Navigation & Liveblocks Room"

Cohesion: 0.16
Nodes (16): EditorNavbar(), EditorNavbarProps, LiveblocksRoom(), LiveblocksRoomProps, CanvasSaveStatus, CanvasSaveStatusContext, CanvasSaveStatusContextValue, CanvasSaveStatusProvider() (+8 more)

### Community 13 - "Canvas Controls & Zoom UI"

Cohesion: 0.21
Nodes (13): CANVAS_ZOOM_DURATION, CanvasControls(), CanvasControlsProps, ControlButton(), Card(), CardAction(), CardContent(), CardDescription() (+5 more)

### Community 14 - "Project Dialogs & Editor Home"

Cohesion: 0.18
Nodes (11): DialogPattern(), EditorHome(), DialogFooterActionsProps, ProjectDialogs(), ProjectNameDialogProps, useProjectDialogsContext(), renderActiveDialog(), ProjectListItem() (+3 more)

### Community 15 - "Architecture Starter Templates"

Cohesion: 0.18
Nodes (12): CANVAS_TEMPLATES, CanvasTemplate, cicd, eventDriven, microservices, nodeCenter(), nodeSize(), PreviewShape() (+4 more)

### Community 16 - "Share Dialog & Collaborator Management"

Cohesion: 0.19
Nodes (13): ShareDialog(), readApiError(), readCollaborator(), readCollaborators(), readCreatedCollaborator(), RemoveLock, ShareCollaborator, ShareCollaboratorsPayload (+5 more)

### Community 17 - "Canvas Shape Node Component"

Cohesion: 0.20
Nodes (12): CanvasNodeComponent(), canvasNodeTypes, getHandleStyle(), HandleSide, MIN_SHAPE_SIZES, NodeActionsContext, NodeActionsContextType, resolveNodeSize() (+4 more)

### Community 18 - "Project Sidebar & Listing"

Cohesion: 0.23
Nodes (9): EmptyProjectsPlaceholderProps, ProjectSidebar(), ProjectSidebarTab, tabForCurrentRoom(), Tabs(), TabsContent(), TabsList(), tabsListVariants (+1 more)

### Community 19 - "Canvas Shape Drag Palette"

Cohesion: 0.21
Nodes (12): isCanvasShape(), readShapeDragPayload(), SHAPE_DRAG_MIME, ShapeDragPayload, shapeIconComponents, ShapePanel(), ShapePanelProps, shapes (+4 more)

### Community 20 - "System Architecture & Invariants"

Cohesion: 0.24
Nodes (11): AI Design and Spec Generation Pipelines, System Architectural Boundaries, Core Architectural Invariants, OmniArch Technology Stack, Tiered Storage Model, Natural Language AI Architect Flow, Resilient Blob Lifecycle and Cleanup Flow, OmniArch Collaborative System Design Platform (+3 more)

### Community 21 - "Canvas Keyboard Shortcuts & Interactions"

Cohesion: 0.24
Nodes (6): CanvasFlow(), FlowCursor(), isDialogTarget(), isEditableTarget(), useKeyboardShortcuts(), onKeyDown()

### Community 22 - "AI & Cloud Provider Dependencies"

Cohesion: 0.22
Nodes (9): ai, @ai-sdk/google, @liveblocks/node, dependencies, ai, @ai-sdk/google, @liveblocks/node, react (+1 more)

### Community 23 - "Geometric Canvas Shape Primitives"

Cohesion: 0.31
Nodes (5): CircleShape(), PillShape(), RectangleShape(), shapeStroke(), ShapeVisualProps

### Community 24 - "UI Layout & Canvas Screenshot"

Cohesion: 0.25
Nodes (9): AI Workspace Assistant Panel, Architecture Diagram Nodes, Interactive Architecture Canvas, Protocol Labeled Connection Edges, Projects Sidebar Panel, AI Architecture Prompt Input, OmniArch Editor Screen Mockup, Floating Shape Palette Toolbar (+1 more)

### Community 25 - "Architecture Spec Generation UI"

Cohesion: 0.25
Nodes (4): formatSpecDate(), SpecPreviewDialog(), SpecsTab(), useSpecGenerationRun()

### Community 26 - "Collaboration Sharing Modal UI"

Cohesion: 0.29
Nodes (4): RoleBadge(), ShareDialogProps, ScrollArea(), ScrollBar()

### Community 27 - "Root Layout & Typography"

Cohesion: 0.33
Nodes (5): geistMono, geistSans, metadata, RootLayout(), clerkAppearance

### Community 29 - "Code Standards & Engineering Guidelines"

Cohesion: 0.29
Nodes (7): Protected Foundation Components Policy, Subsystem Scoping and Splitting Rules, Spec-Driven Incremental Development Workflow, Core Engineering Philosophy, Design Tokens and Styling Rules, Tailwind Class Merging Utility cn, Design System Specification

### Community 30 - "Canvas Data Validation Utilities"

Cohesion: 0.57
Nodes (6): CANVAS_SHAPES, isCanvasEdge(), isCanvasNode(), isCanvasSnapshot(), isFiniteNumber(), isRecord()

### Community 31 - "Agent Rules & Development Context"

Cohesion: 0.50
Nodes (4): Context Documentation Reading Order, Prettier Formatting Rule, Agent Instructions and Next.js Rules, Claude Assistant Context and Guidelines

### Community 33 - "Canvas Node & Edge Editing Specs"

Cohesion: 0.50
Nodes (4): Inline Node Label Editing, Custom Canvas Edge Renderer, Four-Side Node Connection Handles, Inline Edge Label Editing

### Community 34 - "AI Workspace Sidebar Tabs Spec"

Cohesion: 0.67
Nodes (3): AI Architect Chat Tab, AI Workspace Sidebar Shell, AI Specs Tab

## Knowledge Gaps

- **217 isolated node(s):** `geistSans`, `geistMono`, `metadata`, `$schema`, `style` (+212 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 279 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:*

- **Why does `cn()` connect `Canvas Controls & Zoom UI` to `Live AI Architect Chat Panel`, `AI Sidebar View & Tabs`, `Project Dialogs & Editor Home`, `Project Sidebar & Listing`, `Canvas Shape Drag Palette`, `Collaboration Sharing Modal UI`, `Root Layout & Typography`?**
  *High betweenness centrality (0.035) - this node is a cross-community bridge.*
- **Why does `dependencies` connect `AI & Cloud Provider Dependencies` to `Linting & Build DevDependencies`, `Class Variance Authority Library`, `Clerk Authentication Library`, `Clerk UI Library`, `Clsx Class Utility Library`, `Dotenv Environment Library`, `Liveblocks Client Library`, `Liveblocks React Integration Library`, `Liveblocks React Flow Library`, `Liveblocks UI Library`, `Lucide React Icons`, `Next.js Framework Core`, `Node PostgreSQL Driver`, `Prisma PostgreSQL Adapter`, `Prisma Client ORM`, `Prisma Accelerate Extension`, `Radix UI Primitives`, `React DOM Library`, `React Error Boundary`, `React Markdown Renderer`, `Shadcn CLI Tooling`, `Tailwind Merge Utility`, `Trigger.dev React Hooks`, `Trigger.dev SDK`, `Tailwind Animate CSS`, `Vercel Blob Storage`, `XYFlow React Flow Library`, `Zod Schema Validation`?**
  *High betweenness centrality (0.015) - this node is a cross-community bridge.*
- **What connects `geistSans`, `geistMono`, `metadata` to the rest of the system?**
  *217 weakly-connected nodes found - possible documentation gaps or missing edges.*
- **Should `Backend API Routes` be split into smaller, more focused modules?**
  *Cohesion score 0.058333333333333334 - nodes in this community are weakly interconnected.*
- **Should `Design Agent & Spec Pipelines` be split into smaller, more focused modules?**
  *Cohesion score 0.0706605222734255 - nodes in this community are weakly interconnected.*
- **Should `Linting & Build DevDependencies` be split into smaller, more focused modules?**
  *Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected.*
- **Should `Canvas Interaction & Styling Specs` be split into smaller, more focused modules?**
  *Cohesion score 0.05512820512820513 - nodes in this community are weakly interconnected.*
