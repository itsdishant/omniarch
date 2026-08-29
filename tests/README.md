# OmniArch End-to-End (E2E) Test Suite

This directory contains the comprehensive end-to-end (E2E) test suite for **OmniArch**, built with [Playwright](https://playwright.dev/) and integrated with [@clerk/testing](https://clerk.com/docs/testing/playwright).

---

## 🏛️ Architecture & Design Principles

The test architecture is designed around four key pillars:

1. **Single Responsibility per Test File**:
   - Every file or distinct functional domain in the application is mapped to a dedicated test specification.
   - Avoids monolithic test files, preventing cascading timeouts and enabling targeted test execution.

2. **Deterministic & Fast Authentication**:
   - Uses `@clerk/testing/playwright` and `@clerk/backend` in `global.setup.ts` to provision dedicated testing users and bypass bot-detection challenges.
   - Automatically maintains the test user pool to avoid hitting Clerk's free-tier development quotas.

3. **Isolated Test Execution**:
   - Tests execute against a real running Next.js application server (`http://localhost:3000`) and live database/mocked backend interfaces.
   - Browser permissions (e.g. `clipboard-read`, `clipboard-write`) and clean states are configured per fixture.

4. **Multi-Layer Validation**:
   - **UI & Interaction**: Ensures interactive elements (drag-and-drop shapes, inline text editing, modal dialogs, toolbar swatches, slide-over panels) behave correctly.
   - **Route Guards & Security**: Validates unauthenticated redirects, authenticated route access, and cross-workspace access boundaries.
   - **REST API Contracts**: Validates backend route handlers, payload schemas, and response status codes.

---

## 📂 Directory Structure

```
tests/
├── README.md                                  # Test suite architecture and documentation (this file)
├── global.setup.ts                            # Global setup fixture: Clerk token & user pool lifecycle
├── helpers/
│   └── test-auth.ts                           # Shared authentication & workspace creation test helpers
├── auth/                                      # Authentication flows and Clerk form interactions
│   ├── sign-in.spec.ts                        # Sign-in form rendering, controls, navigation, and login
│   ├── sign-up.spec.ts                        # Sign-up form rendering, controls, and navigation
│   └── route-protection.spec.ts               # Unauthenticated route guards for /editor and /editor/[roomId]
├── routing/                                   # Application routing and error handling
│   ├── landing-redirect.spec.ts               # Landing page redirects (unauthenticated vs authenticated)
│   └── access-denied.spec.ts                  # Unauthorized or non-existent workspace error boundary
├── editor/                                    # Workspace management and top-level navigation
│   ├── editor-home.spec.ts                    # Empty state, welcome headings, and project triggers
│   ├── project-creation.spec.ts               # Project modal, room slug generator preview, redirect
│   ├── project-rename.spec.ts                 # Project rename modal and title updates
│   ├── project-delete.spec.ts                 # Project delete confirmation and removal from list
│   ├── project-sidebar.spec.ts                # Slide-over sidebar drawer, tab toggle, and navigation
│   └── navbar.spec.ts                         # Workspace navbar identity, actions, and close button
├── canvas/                                    # Interactive visual architecture canvas (ReactFlow / Liveblocks)
│   ├── shape-panel.spec.ts                    # Floating toolbar with all 6 custom shape types
│   ├── starter-templates.spec.ts              # Starter templates modal preview and architecture import
│   ├── node-operations.spec.ts                # Node selection, inline label double-click editing, deletion
│   ├── node-styling.spec.ts                   # Floating node selection color toolbar (8 theme swatches)
│   ├── edge-connections.spec.ts               # Custom smoothstep edges, badge labels, inline editing
│   ├── canvas-controls.spec.ts                # Zoom In/Out, Fit View, Undo & Redo controls
│   └── canvas-autosave.spec.ts                # Liveblocks save status indicator and manual save trigger
├── collaboration/                             # Real-time multi-user collaboration
│   ├── share-dialog.spec.ts                   # Share dialog, owner badge, link copy with clipboard permissions
│   └── collaborators.spec.ts                  # Collaborator invitation by email and access removal
├── ai/                                        # AI architecture generation & technical specification engine
│   ├── ai-sidebar-toggle.spec.ts              # Workspace AI sidebar toggle open/close
│   ├── ai-architect-chat.spec.ts              # Starter prompt suggestions, input binding, prompt submission
│   ├── ai-spec-generation.spec.ts             # Specs tab navigation, empty state, and trigger action
│   └── ai-spec-preview-download.spec.ts       # Spec API endpoints, download URLs, and modal preview
└── api/                                       # REST API endpoint contract tests
    ├── project-routes.spec.ts                 # CRUD operations for /api/projects & /api/projects/[id]
    ├── collaborator-routes.spec.ts            # Collaborator management via /api/projects/[id]/collaborators
    ├── canvas-routes.spec.ts                  # Canvas persistence via /api/projects/[id]/canvas
    ├── spec-routes.spec.ts                    # Technical spec list retrieval via /api/projects/[id]/specs
    ├── liveblocks-auth-routes.spec.ts         # Liveblocks room session token auth validation
    └── ai-routes.spec.ts                      # AI trigger token REST verification and validation
```

---

## 🔑 Authentication & Global Setup (`tests/global.setup.ts`)

Clerk development instances have built-in rate limits and bot challenges (Cloudflare Turnstile). The test suite handles this seamlessly:

1. **`clerkSetup()`**: Initializes the testing token from `@clerk/testing/playwright`.
2. **Quota Management**: Automatically queries the Clerk Backend API to delete ephemeral test users, preventing the 100-user dev instance cap from ever being exceeded.
3. **Dedicated Runner Account**: Automatically provisions a standard E2E runner account (`omniarch.e2e.runner+clerk_test@example.com`).
4. **`clerk.signIn()` Helper**: Uses Clerk's secure ticket-based sign-in strategy in `tests/helpers/test-auth.ts` for fast authentication without UI delays or OTP captchas.

---

## 🚀 Running Tests

### Run All Tests

```bash
npx playwright test
```

### Run a Specific Domain / Directory

```bash
# Run Auth and Routing tests only
npx playwright test tests/auth/ tests/routing/

# Run Canvas tests only
npx playwright test tests/canvas/

# Run Editor and Project Management tests
npx playwright test tests/editor/

# Run AI Workspace tests
npx playwright test tests/ai/

# Run REST API contract tests
npx playwright test tests/api/
```

### Run a Single Test File

```bash
npx playwright test tests/canvas/node-styling.spec.ts
```

### Interactive UI Mode

```bash
npx playwright test --ui
```

### Debugging with Playwright Inspector

```bash
npx playwright test --debug
```

### View HTML Test Report

```bash
npx playwright show-report
```

---

## 📝 Best Practices for Writing Tests

When adding new test files to this repository, adhere to the following conventions:

1. **File Location**: Place new test files in their corresponding domain folder under `tests/<domain>/<feature-name>.spec.ts`.
2. **Descriptive Test Naming**: Use `test.describe("Domain - Feature", ...)` and clear `test("action and expected behavior", ...)` descriptions.
3. **Auth Helpers**: For any test requiring an authenticated user, import `createAndSignInTestUser` and `createTestProject` from `../helpers/test-auth`.
4. **Resilient Locators**: Prefer user-facing semantic locators (`page.getByRole`, `page.getByLabel`, `page.getByText`) over brittle CSS classes or XPath selectors.
5. **Exact Match when Necessary**: When text might match both headers and descriptions, use exact matching (e.g. `page.getByText("Workspace", { exact: true })`).
6. **Canvas Suspense Awareness**: When testing canvas components, always wait for the canvas toolbar (`page.getByRole("toolbar", { name: /shape tools/i })`) to be visible to ensure Liveblocks client-side suspense has completed rendering.
