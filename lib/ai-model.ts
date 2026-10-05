import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { AbortTaskRunError } from "@trigger.dev/sdk";

/**
 * Fallback model used when `AI_MODEL` is not set. Env files are gitignored,
 * so remote Trigger.dev task runs rely on `AI_MODEL` being configured in the
 * dashboard; this keeps them working if it isn't.
 */
const FALLBACK_AI_MODEL = "inclusionai/ling-3.0-flash-sante:free";

export { FALLBACK_AI_MODEL };

/** Model used for all AI chat work (design agent + spec generation). */
export const AI_MODEL = process.env.AI_MODEL ?? FALLBACK_AI_MODEL;

/**
 * Creates an OpenRouter-backed chat model for `modelId` (defaults to {@link AI_MODEL}).
 *
 * Throws an {@link AbortTaskRunError} when `OPENROUTER_API_KEY` is unset so the
 * run fails with an actionable message instead of a provider auth error.
 */
export function aiModel(modelId: string = AI_MODEL) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new AbortTaskRunError(
      "Missing OpenRouter API key (OPENROUTER_API_KEY)",
    );
  }

  return createOpenRouter({ apiKey })(modelId);
}
