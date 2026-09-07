---
type: "query"
date: "2026-09-05T08:42:06.248454+00:00"
question: "show the auth flow"
contributor: "graphify"
outcome: "useful"
source_nodes: ["Authentication Integration Specification", "Clerk Auth Proxy and Route Protection", "getCurrentClerkIdentity()", "findAccessibleProjectForViewer()", "liveblocks-auth/route.ts", "AuthSplitLayout()", "SignedOutRedirect()"]
---

# Q: show the auth flow

## Answer

Expanded from original query via vocab: [auth, authentication, authorization, credentials, flow, protected, protection, security, session, token, user, workflow]. Traversed authentication architecture: Clerk integration via RootLayout and proxy.ts route protection; Sign-in/Sign-up split layout; Protected workspace routing via SignedOutRedirect and EditorLayout; Server-side project access validation via getCurrentClerkIdentity() and findAccessibleProjectForViewer() in lib/project-access.ts; Real-time WebSocket room authorization via POST app/api/liveblocks-auth/route.ts; Collaborator profile enrichment in lib/clerk-profiles.ts; and Playwright deterministic auth helpers in tests/helpers/test-auth.ts.

## Outcome

- Signal: useful

## Source Nodes

- Authentication Integration Specification
- Clerk Auth Proxy and Route Protection
- getCurrentClerkIdentity()
- findAccessibleProjectForViewer()
- liveblocks-auth/route.ts
- AuthSplitLayout()
- SignedOutRedirect()