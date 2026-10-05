import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, test } from "node:test";

/**
 * Guards the dev/prod env split. `.env*` is gitignored, so these files exist
 * only locally; when absent the suite skips rather than failing.
 */

const DEV_ENV = ".env.local";
const PROD_ENV = ".env.production.local";

/** Keys that are expected to differ between the dev and prod env files. */
const EXPECTED_DIFFS = new Set(["TRIGGER_SECRET_KEY", "LIVEBLOCKS_SECRET_KEY"]);

function parseEnvFile(path: string): Map<string, string> {
  const entries = new Map<string, string>();

  for (const rawLine of readFileSync(path, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^"|"$/g, "");
    entries.set(key, value);
  }

  return entries;
}

describe("env parity - .env.local vs .env.production.local", () => {
  const bothPresent = existsSync(DEV_ENV) && existsSync(PROD_ENV);

  test("dev and prod env files both exist", { skip: !bothPresent }, () => {
    assert.ok(bothPresent, "both env files should exist locally");
  });

  test(
    "prod defines every key the dev file defines",
    { skip: !bothPresent },
    () => {
      const dev = parseEnvFile(DEV_ENV);
      const prod = parseEnvFile(PROD_ENV);

      const missing = [...dev.keys()].filter((key) => !prod.has(key));
      assert.deepEqual(missing, [], `prod env is missing keys: ${missing}`);
    },
  );

  test(
    "only the expected keys differ between dev and prod",
    { skip: !bothPresent },
    () => {
      const dev = parseEnvFile(DEV_ENV);
      const prod = parseEnvFile(PROD_ENV);

      const differing = [...dev.entries()]
        .filter(([key, value]) => prod.get(key) !== value)
        .map(([key]) => key);

      const unexpected = differing.filter((key) => !EXPECTED_DIFFS.has(key));
      assert.deepEqual(
        unexpected,
        [],
        `these keys should match across environments: ${unexpected}`,
      );
    },
  );

  test(
    "dev and prod use different Trigger secret keys",
    { skip: !bothPresent },
    () => {
      const dev = parseEnvFile(DEV_ENV);
      const prod = parseEnvFile(PROD_ENV);

      const devKey = dev.get("TRIGGER_SECRET_KEY");
      const prodKey = prod.get("TRIGGER_SECRET_KEY");

      assert.ok(devKey && prodKey, "both files must define TRIGGER_SECRET_KEY");
      assert.notEqual(
        devKey,
        prodKey,
        "prod must not reuse the dev secret key",
      );
      assert.match(devKey!, /^tr_dev_/, "dev key should be a tr_dev_ key");
      assert.match(prodKey!, /^tr_prod_/, "prod key should be a tr_prod_ key");
    },
  );

  test("AI_MODEL is present in both files", { skip: !bothPresent }, () => {
    const dev = parseEnvFile(DEV_ENV);
    const prod = parseEnvFile(PROD_ENV);

    assert.ok(dev.get("AI_MODEL"), "dev env must define AI_MODEL");
    assert.ok(prod.get("AI_MODEL"), "prod env must define AI_MODEL");
  });
});
