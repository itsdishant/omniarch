import { existsSync } from "node:fs";
import { config } from "dotenv";

/**
 * Path to the env file matching the current NODE_ENV, e.g. `.env.production.local`
 * or `.env.development.local`. Falls back to `.env.local` when the
 * environment-specific file is absent, and then to `.env`.
 *
 * Needed because Prisma and the test harness run outside the Next.js server, so
 * they cannot rely on Next's own env loading.
 */
export function envFilePath(): string[] {
  const nodeEnv = process.env.NODE_ENV;

  const candidates = [
    nodeEnv && `.env.${nodeEnv}.local`,
    ".env.local",
    ".env",
  ].filter((path): path is string => Boolean(path));

  return candidates.filter((path) => existsSync(path));
}

/** Loads the env file for the current NODE_ENV without overriding real env vars. */
export function loadEnv() {
  for (const path of envFilePath()) {
    config({ path, quiet: true });
  }
}
