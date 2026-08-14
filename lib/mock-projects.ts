export interface MockProject {
  id: string;
  name: string;
  slug: string;
}

export const MOCK_OWNED_PROJECTS: MockProject[] = [
  { id: "owned-1", name: "Payments Platform", slug: "payments-platform" },
  { id: "owned-2", name: "Auth Service", slug: "auth-service" },
];

export const MOCK_SHARED_PROJECTS: MockProject[] = [
  { id: "shared-1", name: "Checkout Graph", slug: "checkout-graph" },
];
