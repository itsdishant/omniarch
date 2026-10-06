import assert from "node:assert/strict";
import { describe, test } from "node:test";

const MODEL_MODULE = new URL("../../lib/ai-model.ts", import.meta.url).href;

/** Loads a fresh copy of lib/ai-model.ts so module-level env reads re-run. */
async function loadModule() {
  return import(`${MODEL_MODULE}?t=${Math.random()}`);
}

const ORIGINAL_ENV = { ...process.env };

function setEnv(values: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

function restoreEnv() {
  process.env = { ...ORIGINAL_ENV };
}

describe("ai-model - model resolution", () => {
  test("resolves the model id from AI_MODEL", async () => {
    setEnv({ AI_MODEL: "some-vendor/some-model:free" });
    try {
      const { AI_MODEL } = await loadModule();
      assert.equal(AI_MODEL, "some-vendor/some-model:free");
    } finally {
      restoreEnv();
    }
  });

  test("falls back to the bundled default when AI_MODEL is unset", async () => {
    setEnv({ AI_MODEL: undefined });
    try {
      const { AI_MODEL, FALLBACK_AI_MODEL } = await loadModule();
      assert.equal(AI_MODEL, FALLBACK_AI_MODEL);
      assert.ok(FALLBACK_AI_MODEL, "a fallback model must exist");
    } finally {
      restoreEnv();
    }
  });

  test("an empty AI_MODEL falls back instead of yielding a blank model id", async () => {
    // `??` alone would keep "" and hand OpenRouter an empty model id, failing
    // every generation task with a confusing provider error.
    for (const value of ["", "   ", "\t\n"]) {
      setEnv({ AI_MODEL: value });
      try {
        const { AI_MODEL, FALLBACK_AI_MODEL } = await loadModule();
        assert.equal(
          AI_MODEL,
          FALLBACK_AI_MODEL,
          `AI_MODEL=${JSON.stringify(value)} should fall back`,
        );
      } finally {
        restoreEnv();
      }
    }
  });

  test("surrounding whitespace is trimmed from AI_MODEL", async () => {
    setEnv({ AI_MODEL: "  vendor/model:free  " });
    try {
      const { AI_MODEL } = await loadModule();
      assert.equal(AI_MODEL, "vendor/model:free");
    } finally {
      restoreEnv();
    }
  });
});

describe("ai-model - aiModel()", () => {
  test("builds an OpenRouter model using AI_MODEL by default", async () => {
    setEnv({
      AI_MODEL: "some-vendor/some-model:free",
      OPENROUTER_API_KEY: "sk-or-v1-test",
    });
    try {
      const { aiModel } = await loadModule();
      const model = aiModel();

      assert.equal(model.modelId, "some-vendor/some-model:free");
      assert.equal(model.provider, "openrouter");
    } finally {
      restoreEnv();
    }
  });

  test("honours an explicit modelId override", async () => {
    setEnv({ OPENROUTER_API_KEY: "sk-or-v1-test" });
    try {
      const { aiModel } = await loadModule();
      assert.equal(
        aiModel("explicit/model:free").modelId,
        "explicit/model:free",
      );
    } finally {
      restoreEnv();
    }
  });

  test("throws AbortTaskRunError when OPENROUTER_API_KEY is missing", async () => {
    setEnv({ OPENROUTER_API_KEY: undefined, TRIGGER_DEPLOYMENT_ID: undefined });
    try {
      const { aiModel } = await loadModule();

      assert.throws(
        () => aiModel(),
        (error: unknown) => {
          assert.ok(error instanceof Error);
          assert.equal(error.name, "AbortTaskRunError");
          assert.match(error.message, /OPENROUTER_API_KEY/);
          return true;
        },
      );
    } finally {
      restoreEnv();
    }
  });

  test("names the environment so prod-only drift is diagnosable", async () => {
    // The key lives in .env files locally and in the Trigger.dev dashboard for
    // deployed runs, and `trigger deploy` does not sync them. A message that
    // only said "missing key" hid that the cloud env was the stale side.
    for (const [deploymentId, expected] of [
      ["dep_123", "cloud"],
      [undefined, "local"],
    ] as const) {
      setEnv({
        OPENROUTER_API_KEY: undefined,
        TRIGGER_DEPLOYMENT_ID: deploymentId,
      });
      try {
        const { aiModel } = await loadModule();

        assert.throws(
          () => aiModel(),
          (error: unknown) => {
            assert.ok(error instanceof Error);
            assert.match(
              error.message,
              new RegExp(`in the ${expected} environment`),
              `TRIGGER_DEPLOYMENT_ID=${deploymentId} should report "${expected}"`,
            );
            return true;
          },
        );
      } finally {
        restoreEnv();
      }
    }
  });

  test("the error never leaks a credential value", async () => {
    setEnv({ OPENROUTER_API_KEY: "  ", TRIGGER_DEPLOYMENT_ID: "dep_123" });
    try {
      const { aiModel } = await loadModule();

      assert.throws(
        () => aiModel(),
        (error: unknown) => {
          assert.ok(error instanceof Error);
          assert.doesNotMatch(error.message, /sk-or-v1/);
          assert.doesNotMatch(error.message, /dep_123/);
          return true;
        },
      );
    } finally {
      restoreEnv();
    }
  });

  test("never passes a blank model id to the provider", async () => {
    setEnv({ OPENROUTER_API_KEY: "sk-or-v1-test" });
    try {
      const { aiModel, AI_MODEL } = await loadModule();

      for (const blank of ["", "   "]) {
        assert.equal(
          aiModel(blank).modelId,
          AI_MODEL,
          `a blank override (${JSON.stringify(blank)}) should fall back`,
        );
      }
    } finally {
      restoreEnv();
    }
  });

  test("throws before touching the model when the key is missing, not after", async () => {
    setEnv({ OPENROUTER_API_KEY: undefined });
    try {
      const { aiModel } = await loadModule();

      // No network call should happen; the throw is a guard, not a provider error.
      assert.throws(() => aiModel(), { name: "AbortTaskRunError" });
    } finally {
      restoreEnv();
    }
  });
});
