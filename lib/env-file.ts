import { existsSync } from "node:fs";
import { config } from "dotenv";

/**
 * Env files to load for the current `NODE_ENV`, highest precedence first.
 *
 * Next.js performs this selection itself for the app server. This helper exists
 * for code that runs outside that server — the Prisma CLI, which `prebuild`
 * and migrations invoke in their own process — so it must not rely on Next.
 *
 * Under `NODE_ENV=production` the chain deliberately stops at
 * `.env.production.local` and `.env`. It does **not** fall back to
 * `.env.local`, which holds development credentials. A production run that is
 * missing production config should fail loudly rather than silently inherit a
 * development database or API key.
 */
export function envFilePath(): string[] {
  const nodeEnv = process.env.NODE_ENV;

  if (nodeEnv === "production") {
    return [".env.production.local", ".env"].filter(existsSync);
  }

  const candidates = [
    nodeEnv && `.env.${nodeEnv}.local`,
    ".env.local",
    ".env",
  ].filter((path): path is string => Boolean(path));

  return candidates.filter((path) => existsSync(path));
}

/**
 * Loads the env file for the current `NODE_ENV` without overriding variables
 * already present in `process.env`, so real environment configuration always
 * wins over file contents.
 */
export function loadEnv() {
  for (const path of envFilePath()) {
    config({ path, quiet: true });
  }
}
