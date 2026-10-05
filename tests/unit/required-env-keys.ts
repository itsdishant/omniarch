/**
 * Env keys the application requires, and how each is classified for the
 * dev/prod parity check.
 *
 * This list is committed and non-secret so the required-key contract can be
 * tested even on a fresh checkout where the gitignored env files are absent.
 */

/** Every env key the app, Prisma, or the AI tasks read at runtime. */
export const REQUIRED_ENV_KEYS = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
  "NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL",
  "DATABASE_URL",
  "LIVEBLOCKS_SECRET_KEY",
  "BLOB_READ_WRITE_TOKEN",
  "TRIGGER_PROJECT_REF",
  "TRIGGER_SECRET_KEY",
  "TRIGGER_API_URL",
  "OPENROUTER_API_KEY",
  "AI_MODEL",
] as const;

/**
 * Keys that legitimately hold different values in development and production.
 *
 * These are credentials and per-environment identifiers. Each one is tied to a
 * separate account, instance, or resource in a properly isolated setup, so the
 * parity check must tolerate them differing:
 *
 * - Clerk keys: separate Clerk instances publish different keys.
 * - `LIVEBLOCKS_SECRET_KEY`: separate Liveblocks projects.
 * - `BLOB_READ_WRITE_TOKEN`: separate Blob stores.
 * - `OPENROUTER_API_KEY`: separate provider accounts, and dev keys are often
 *   scoped or rate-limited differently.
 * - `TRIGGER_PROJECT_REF` / `TRIGGER_SECRET_KEY` / `TRIGGER_API_URL`: separate
 *   Trigger.dev projects and environments.
 * - `DATABASE_URL`: separate databases. Sharing one is a data-safety problem,
 *   so the suite must never push a developer toward making the URLs equal.
 * - `AI_MODEL`: development may use a cheaper or free-tier model than
 *   production.
 *
 * Anything not listed here is expected to match across environments. That is
 * what keeps the check useful rather than vacuous.
 */
export const ENVIRONMENT_SPECIFIC_KEYS = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "DATABASE_URL",
  "LIVEBLOCKS_SECRET_KEY",
  "BLOB_READ_WRITE_TOKEN",
  "TRIGGER_PROJECT_REF",
  "TRIGGER_SECRET_KEY",
  "TRIGGER_API_URL",
  "OPENROUTER_API_KEY",
  "AI_MODEL",
] as const;

/**
 * Keys holding a secret that is expected to be *different* per environment,
 * not merely permitted to be.
 *
 * Shared accounts are legitimate for some providers (a single Clerk instance
 * can serve both environments), so these are deliberately narrow. `TRIGGER_
 * SECRET_KEY` belongs here because Trigger.dev issues distinct dev and prod
 * keys for one project, and reusing the dev key in production is a real bug.
 *
 * Note: `LIVEBLOCKS_SECRET_KEY` currently fails this check because the
 * production value was copied from development. That is a configuration
 * problem, not a test defect — add a genuine production key to fix it.
 */
export const MUST_DIFFER_KEYS = [
  "TRIGGER_SECRET_KEY",
  "LIVEBLOCKS_SECRET_KEY",
] as const;

/**
 * Config keys that must stay identical across environments, listed explicitly
 * so the intent is reviewable. These are relative in-app routes that do not
 * depend on the deployment domain.
 */
export const SHARED_CONFIG_KEYS = [
  "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
  "NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL",
] as const;

/**
 * Credential-shaped key names. Any required key matching this pattern must be
 * classified as environment-specific, so a newly added secret cannot silently
 * become a "must match across environments" key.
 */
export const CREDENTIAL_KEY_PATTERN =
  /(KEY|SECRET|TOKEN|DATABASE_URL|API_URL|PROJECT_REF|^AI_MODEL$)/;
