import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, test } from "node:test";

import {
  CREDENTIAL_KEY_PATTERN,
  ENVIRONMENT_SPECIFIC_KEYS,
  MUST_DIFFER_KEYS,
  REQUIRED_ENV_KEYS,
  SHARED_CONFIG_KEYS,
} from "./required-env-keys";

/**
 * Guards the dev/prod env split.
 *
 * Required-key coverage is checked against a committed, non-secret list, so it
 * still runs on a fresh checkout. The value-level comparisons (secrets must
 * differ, only environment-specific keys may drift) need the real gitignored
 * files and skip when those are absent.
 */

const DEV_ENV = ".env.local";
const PROD_ENV = ".env.production.local";

const DEV_PRESENT = existsSync(DEV_ENV);
const PROD_PRESENT = existsSync(PROD_ENV);
const BOTH_PRESENT = DEV_PRESENT && PROD_PRESENT;

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

const ENV_FILES: Array<[label: string, path: string, present: boolean]> = [
  [DEV_ENV, DEV_ENV, DEV_PRESENT],
  [PROD_ENV, PROD_ENV, PROD_PRESENT],
];

describe("env parity - required keys", () => {
  for (const [label, path, present] of ENV_FILES) {
    test(
      `${label} defines every required key (skipped when the file is gitignored and absent)`,
      { skip: present ? false : `${path} not present` },
      () => {
        const entries = parseEnvFile(path);
        const missing = REQUIRED_ENV_KEYS.filter((key) => {
          const value = entries.get(key);
          return value === undefined || value === "";
        });

        assert.deepEqual(missing, [], `${path} is missing keys: ${missing}`);
      },
    );
  }

  test("the required-key list is non-empty and has no duplicates", () => {
    assert.ok(REQUIRED_ENV_KEYS.length > 0);
    assert.equal(
      new Set(REQUIRED_ENV_KEYS).size,
      REQUIRED_ENV_KEYS.length,
      "required key list contains duplicates",
    );
  });

  test("every required key is classified exactly once", () => {
    const classified = [...ENVIRONMENT_SPECIFIC_KEYS, ...SHARED_CONFIG_KEYS];

    assert.equal(
      new Set(classified).size,
      classified.length,
      "a key appears in more than one classification list",
    );

    const unclassified = REQUIRED_ENV_KEYS.filter(
      (key) => !classified.includes(key as never),
    );

    assert.deepEqual(
      unclassified,
      [],
      `these keys are neither environment-specific nor shared config: ${unclassified}`,
    );
  });

  test("every credential-shaped key is classified environment-specific", () => {
    // A secret that defaults to "must match" would pressure a developer into
    // sharing one credential across environments, which is the opposite of the
    // intent of this file.
    const misclassified = REQUIRED_ENV_KEYS.filter(
      (key) =>
        CREDENTIAL_KEY_PATTERN.test(key) &&
        !ENVIRONMENT_SPECIFIC_KEYS.includes(key as never),
    );

    assert.deepEqual(
      misclassified,
      [],
      `credential-shaped keys must be listed in ENVIRONMENT_SPECIFIC_KEYS so ` +
        `separate per-environment credentials are allowed: ${misclassified}`,
    );
  });

  test("keys expected to differ are a subset of environment-specific keys", () => {
    const orphans = MUST_DIFFER_KEYS.filter(
      (key) => !ENVIRONMENT_SPECIFIC_KEYS.includes(key as never),
    );

    assert.deepEqual(orphans, []);
  });

  test("the required-key list covers every key the codebase reads", () => {
    // Guards against a new process.env read landing without a matching entry.
    const sourceFiles = [
      "lib/ai-model.ts",
      "lib/env-file.ts",
      "lib/prisma.ts",
      "lib/liveblocks.ts",
      "prisma.config.ts",
    ];

    const referenced = new Set<string>();
    for (const file of sourceFiles) {
      const source = readFileSync(
        new URL(`../../${file}`, import.meta.url),
        "utf8",
      );
      for (const match of source.matchAll(/process\.env\.([A-Z_0-9]+)/g)) {
        referenced.add(match[1]);
      }
    }

    // Injected by the runtime, not read from a file: NODE_ENV by Node/Next,
    // TRIGGER_DEPLOYMENT_ID by the Trigger.dev task runtime. They are never
    // expected in .env files, so they are not part of the configured contract.
    referenced.delete("NODE_ENV");
    referenced.delete("TRIGGER_DEPLOYMENT_ID");

    const unlisted = [...referenced].filter(
      (key) => !REQUIRED_ENV_KEYS.includes(key as never),
    );

    assert.deepEqual(
      unlisted,
      [],
      `these keys are read in code but missing from REQUIRED_ENV_KEYS: ${unlisted}`,
    );
  });
});

describe("env parity - dev vs prod values", () => {
  test(
    "prod defines every key the dev file defines",
    { skip: !BOTH_PRESENT },
    () => {
      const dev = parseEnvFile(DEV_ENV);
      const prod = parseEnvFile(PROD_ENV);

      const missing = [...dev.keys()].filter((key) => !prod.has(key));
      assert.deepEqual(missing, [], `prod env is missing keys: ${missing}`);
    },
  );

  test(
    "only environment-specific keys differ between dev and prod",
    { skip: !BOTH_PRESENT },
    () => {
      const dev = parseEnvFile(DEV_ENV);
      const prod = parseEnvFile(PROD_ENV);

      const differing = [...dev.entries()]
        .filter(([key, value]) => prod.get(key) !== value)
        .map(([key]) => key);

      const unexpected = differing.filter(
        (key) => !ENVIRONMENT_SPECIFIC_KEYS.includes(key as never),
      );

      assert.deepEqual(
        unexpected,
        [],
        `these keys should match across environments: ${unexpected}`,
      );
    },
  );

  test(
    "per-environment secrets are not shared",
    { skip: !BOTH_PRESENT },
    () => {
      const dev = parseEnvFile(DEV_ENV);
      const prod = parseEnvFile(PROD_ENV);

      const shared: string[] = [];

      for (const key of MUST_DIFFER_KEYS) {
        const devValue = dev.get(key);
        const prodValue = prod.get(key);

        assert.ok(devValue && prodValue, `both files must define ${key}`);

        if (devValue === prodValue) {
          shared.push(key);
        }
      }

      assert.deepEqual(
        shared,
        [],
        `${shared.join(", ")} identical in dev and prod. Give production its own ` +
          `secret for each; do not copy the dev value across.`,
      );
    },
  );

  test(
    "prod uses a tr_prod_ Trigger key and dev a tr_dev_ one",
    { skip: !BOTH_PRESENT },
    () => {
      const dev = parseEnvFile(DEV_ENV).get("TRIGGER_SECRET_KEY");
      const prod = parseEnvFile(PROD_ENV).get("TRIGGER_SECRET_KEY");

      assert.ok(dev && prod, "both files must define TRIGGER_SECRET_KEY");
      assert.match(dev, /^tr_dev_/, "dev key should be a tr_dev_ key");
      assert.match(prod, /^tr_prod_/, "prod key should be a tr_prod_ key");
    },
  );

  test(
    "DATABASE_URL may differ; it is not forced to match",
    { skip: !BOTH_PRESENT },
    () => {
      // This test documents intent: DATABASE_URL is allowed to drift, so a
      // failure elsewhere must never be "fixed" by making the URLs equal.
      assert.ok(
        ENVIRONMENT_SPECIFIC_KEYS.includes("DATABASE_URL" as never),
        "DATABASE_URL must remain environment-specific",
      );
    },
  );
});
