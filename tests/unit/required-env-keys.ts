/**
 * Env keys the application requires, and the keys that are expected to hold
 * different values per environment.
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
 * Keys that legitimately differ between development and production.
 *
 * `DATABASE_URL` is included on purpose: pointing both environments at one
 * database is a data-safety problem, so the parity suite must never push a
 * developer toward making the URLs equal. These are the only keys the parity
 * check tolerates differing; anything else drifting apart is reported.
 */
export const ENVIRONMENT_SPECIFIC_KEYS = [
  "TRIGGER_SECRET_KEY",
  "LIVEBLOCKS_SECRET_KEY",
  "DATABASE_URL",
] as const;

/**
 * Keys holding a per-environment secret that must never be shared across
 * environments. Asserted to hold different values when both files are present.
 */
/**
 * Keys holding a per-environment secret that must never be shared across
 * environments.
 *
 * Note: `LIVEBLOCKS_SECRET_KEY` currently fails this check because the
 * production value was copied from development. That is a real configuration
 * problem, not a test defect — add a genuine production key to fix it.
 */
export const SECRET_KEYS = [
  "TRIGGER_SECRET_KEY",
  "LIVEBLOCKS_SECRET_KEY",
] as const;
