import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { AbortTaskRunError } from "@trigger.dev/sdk";

/**
 * Fallback model used when `AI_MODEL` is not set. Env files are gitignored,
 * so remote Trigger.dev task runs rely on `AI_MODEL` being configured in the
 * dashboard; this keeps them working if it isn't.
 */
const FALLBACK_AI_MODEL = "inclusionai/ling-3.0-flash-sante:free";

export { FALLBACK_AI_MODEL };

/**
 * Model used for all AI chat work (design agent + spec generation).
 *
 * An unset, empty, or whitespace-only `AI_MODEL` falls back to
 * {@link FALLBACK_AI_MODEL}. `??` alone would keep an empty string and hand
 * OpenRouter a blank model id, so the emptiness check is explicit.
 */
export const AI_MODEL = process.env.AI_MODEL?.trim() || FALLBACK_AI_MODEL;

/**
 * Identifies the Trigger.dev environment a run is executing in, for error messages.
 *
 * These tasks run in the Trigger.dev cloud, not in the Next.js server, so the key
 * comes from the Trigger.dev environment's own variables. `TRIGGER_DEPLOYMENT_ID`
 * is injected by the runtime; it is absent when a task runs through
 * `trigger dev`, which is the local case where `.env.local` is loaded instead.
 * Only the id is reported, never a credential value.
 */
function runtimeEnvironment(): string {
  return process.env.TRIGGER_DEPLOYMENT_ID ? "cloud" : "local";
}

/**
 * Creates an OpenRouter-backed chat model for `modelId` (defaults to {@link AI_MODEL}).
 *
 * Throws an {@link AbortTaskRunError} when `OPENROUTER_API_KEY` is unset, or when
 * the resolved model id is blank, so the run fails with an actionable message
 * instead of a provider auth or "model not found" error. The key is trimmed for
 * the same reason {@link AI_MODEL} is: an unset-but-blank variable is truthy, and
 * a whitespace key would otherwise reach the provider as an opaque auth error.
 *
 * The message names the environment because this key lives in two independent
 * places: local `.env` files for `trigger dev`, and the Trigger.dev dashboard
 * for deployed runs. `trigger deploy` does not sync environment variables, so a
 * key can be present locally yet missing in the cloud and only fail at runtime.
 */
export function aiModel(modelId: string = AI_MODEL) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();

  if (!apiKey) {
    throw new AbortTaskRunError(
      `Missing OpenRouter API key (OPENROUTER_API_KEY) in the ${runtimeEnvironment()} environment. Set it in the Trigger.dev dashboard for deployed runs, or in .env.local for \`trigger dev\`.`,
    );
  }

  const resolvedModelId = modelId.trim() || AI_MODEL;

  return createOpenRouter({ apiKey })(resolvedModelId);
}
