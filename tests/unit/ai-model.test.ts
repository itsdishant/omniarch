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

  test("an empty AI_MODEL does not silently become the default", async () => {
    setEnv({ AI_MODEL: "" });
    try {
      const { AI_MODEL } = await loadModule();
      assert.equal(AI_MODEL, "");
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
    setEnv({ OPENROUTER_API_KEY: undefined });
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
