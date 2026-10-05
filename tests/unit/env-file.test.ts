import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";

const ENV_FILE_MODULE = new URL("../../lib/env-file.ts", import.meta.url).href;

async function loadModule() {
  return import(`${ENV_FILE_MODULE}?t=${Math.random()}`);
}

/**
 * Runs `fn` inside a throwaway cwd containing exactly the given env files, so
 * each case starts from a clean filesystem and does not leak into its siblings.
 */
async function inEnvDir(
  files: Record<string, string>,
  nodeEnv: string | undefined,
  fn: () => Promise<void>,
) {
  const workdir = mkdtempSync(join(tmpdir(), "omniarch-env-"));
  const previousCwd = process.cwd();
  const previousNodeEnv = env.NODE_ENV;

  for (const [name, contents] of Object.entries(files)) {
    writeFileSync(join(workdir, name), contents);
  }

  if (nodeEnv === undefined) {
    delete env.NODE_ENV;
  } else {
    env.NODE_ENV = nodeEnv;
  }
  process.chdir(workdir);

  try {
    await fn();
  } finally {
    process.chdir(previousCwd);
    if (previousNodeEnv === undefined) {
      delete env.NODE_ENV;
    } else {
      env.NODE_ENV = previousNodeEnv;
    }
    rmSync(workdir, { recursive: true, force: true });
  }
}

/** NODE_ENV is readonly on ProcessEnv in @types/node; mutate via a loose view. */
type MutableEnv = Record<string, string | undefined>;
const env = process.env as unknown as MutableEnv;

const SHARED_LOCAL = "OMNIARCH_PROBE=from-local\n";
const SHARED_PROD = "OMNIARCH_PROBE=from-production\n";

describe("env-file - envFilePath()", () => {
  test("prefers .env.production.local under NODE_ENV=production", async () => {
    await inEnvDir(
      { ".env.local": SHARED_LOCAL, ".env.production.local": SHARED_PROD },
      "production",
      async () => {
        const { envFilePath } = await loadModule();
        assert.deepEqual(envFilePath(), [
          ".env.production.local",
          ".env.local",
        ]);
      },
    );
  });

  test("prefers .env.development.local under NODE_ENV=development", async () => {
    await inEnvDir(
      {
        ".env.local": SHARED_LOCAL,
        ".env.development.local": "OMNIARCH_PROBE=from-development\n",
      },
      "development",
      async () => {
        const { envFilePath } = await loadModule();
        assert.deepEqual(envFilePath(), [
          ".env.development.local",
          ".env.local",
        ]);
      },
    );
  });

  test("omits the env-specific file when it does not exist", async () => {
    await inEnvDir({ ".env.local": SHARED_LOCAL }, "production", async () => {
      const { envFilePath } = await loadModule();
      assert.deepEqual(envFilePath(), [".env.local"]);
    });
  });

  test("falls back to .env.local when NODE_ENV is unset", async () => {
    await inEnvDir({ ".env.local": SHARED_LOCAL }, undefined, async () => {
      const { envFilePath } = await loadModule();
      assert.deepEqual(envFilePath(), [".env.local"]);
    });
  });

  test("returns an empty list when no env file exists", async () => {
    await inEnvDir({}, "production", async () => {
      const { envFilePath } = await loadModule();
      assert.deepEqual(envFilePath(), []);
    });
  });

  test("only returns paths that actually exist", async () => {
    await inEnvDir(
      { ".env.production.local": SHARED_PROD },
      "production",
      async () => {
        const { envFilePath } = await loadModule();
        const paths = envFilePath();
        assert.ok(paths.length > 0, "expected at least one candidate");
        for (const path of paths) {
          assert.ok(existsSync(path), `${path} should exist`);
        }
      },
    );
  });
});

describe("env-file - loadEnv()", () => {
  test("loads the production file ahead of .env.local", async () => {
    await inEnvDir(
      { ".env.local": SHARED_LOCAL, ".env.production.local": SHARED_PROD },
      "production",
      async () => {
        delete process.env.OMNIARCH_PROBE;
        const { loadEnv } = await loadModule();
        loadEnv();
        assert.equal(process.env.OMNIARCH_PROBE, "from-production");
        delete process.env.OMNIARCH_PROBE;
      },
    );
  });

  test("does not override a value already present in process.env", async () => {
    await inEnvDir(
      { ".env.production.local": "OMNIARCH_PROBE=from-file\n" },
      "production",
      async () => {
        process.env.OMNIARCH_PROBE = "from-shell";
        const { loadEnv } = await loadModule();
        loadEnv();
        assert.equal(process.env.OMNIARCH_PROBE, "from-shell");
        delete process.env.OMNIARCH_PROBE;
      },
    );
  });

  test("is a no-op when no env file is present", async () => {
    await inEnvDir({}, "production", async () => {
      delete process.env.OMNIARCH_PROBE;
      const { loadEnv } = await loadModule();
      loadEnv();
      assert.equal(process.env.OMNIARCH_PROBE, undefined);
    });
  });
});
