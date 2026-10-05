import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

/**
 * Source-level guards for the AI tasks. These lock in the provider swap: tasks
 * must build their model through `aiModel()` and must not reintroduce a direct
 * provider construction or a second LLM vendor.
 */

const AI_TASK_FILES = [
  "trigger/design-agent.ts",
  "trigger/generate-spec.ts",
] as const;

function readSource(path: string): string {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

describe("AI tasks - provider wiring", () => {
  for (const path of AI_TASK_FILES) {
    test(`${path} builds its model via aiModel()`, () => {
      const source = readSource(path);

      assert.match(source, /import \{ aiModel \} from "@\/lib\/ai-model"/);
      assert.match(source, /model: aiModel\(\)/);
    });

    test(`${path} does not construct a provider directly`, () => {
      const source = readSource(path);

      for (const forbidden of [
        "createOpenRouter",
        "createGoogleGenerativeAI",
        "createOpenAI",
        "createAnthropic",
      ]) {
        assert.ok(
          !source.includes(forbidden),
          `${path} must not call ${forbidden}; use aiModel()`,
        );
      }
    });

    test(`${path} does not read provider API keys directly`, () => {
      const source = readSource(path);

      assert.ok(
        !/process\.env\.(OPENROUTER_API_KEY|GOOGLE_API_KEY|GEMINI_API_KEY)/.test(
          source,
        ),
        `${path} must read the key through aiModel()`,
      );
    });

    test(`${path} has no leftover Google thinking config`, () => {
      const source = readSource(path);

      for (const forbidden of [
        "providerOptions",
        "thinkingConfig",
        "thinkingLevel",
        "gemini",
        "Google",
      ]) {
        assert.ok(
          !source.includes(forbidden),
          `${path} still references ${forbidden}`,
        );
      }
    });

    test(`${path} does not hardcode a model id`, () => {
      const source = readSource(path);

      assert.ok(
        !/aiModel\("|:\/?free"/.test(source),
        `${path} must not hardcode a model id; set AI_MODEL in the env file`,
      );
    });
  }
});

describe("AI tasks - package manifest", () => {
  test("declares the OpenRouter provider", () => {
    const pkg = JSON.parse(readSource("package.json"));

    assert.ok(
      pkg.dependencies["@openrouter/ai-sdk-provider"],
      "expected @openrouter/ai-sdk-provider dependency",
    );
  });

  test("no longer depends on @ai-sdk/google", () => {
    const pkg = JSON.parse(readSource("package.json"));

    assert.ok(
      !pkg.dependencies["@ai-sdk/google"],
      "@ai-sdk/google should have been removed",
    );
  });
});
