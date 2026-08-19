import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { AbortTaskRunError, logger, task } from "@trigger.dev/sdk";
import { generateText, isStepCount } from "ai";

import { clearAiPresence, updateAiPresence } from "@/lib/ai-presence";
import { publishAiStatus } from "@/lib/ai-status";
import {
  ALLOWED_NODE_COLORS,
  ALLOWED_SHAPES,
  readCanvasGraph,
} from "@/lib/canvas-flow";
import { createDesignCanvasTools } from "@/lib/design-canvas-tools";
import { ensureLiveblocksRoom } from "@/lib/liveblocks";

function googleClient() {
  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ??
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new AbortTaskRunError(
      "Missing Gemini API key (GOOGLE_GENERATIVE_AI_API_KEY, GEMINI_API_KEY, or GOOGLE_API_KEY)",
    );
  }

  return createGoogleGenerativeAI({ apiKey });
}

export const designAgentTask = task({
  id: "design-agent",
  retry: { maxAttempts: 1 },
  run: async (payload: { prompt: string; roomId: string }) => {
    const { prompt, roomId } = payload;
    logger.log("Design agent started", { roomId });

    await ensureLiveblocksRoom(roomId);

    try {
      await updateAiPresence(
        roomId,
        { cursor: { x: 120, y: 80 }, thinking: true },
        180,
      );
      await publishAiStatus(roomId, "Starting design generation…");
      await publishAiStatus(roomId, "Interpreting your prompt…");

      const graph = await readCanvasGraph(roomId);
      const { tools, getAppliedCount } = createDesignCanvasTools(roomId);

      await publishAiStatus(roomId, "Updating the canvas…");

      const startedAt = Date.now();
      const result = await generateText({
        model: googleClient()("gemini-3.6-flash"),
        reasoning: "none",
        providerOptions: {
          google: {
            thinkingConfig: {
              thinkingLevel: "minimal",
              includeThoughts: false,
            },
          },
        },
        tools,
        stopWhen: isStepCount(12),
        system: `You are OmniArch, an architecture diagram assistant.
Mutate the collaborative canvas by calling tools. Do not return a JSON plan.

Tools:
- addNode, moveNode, resizeNode, updateNodeData, deleteNode, addEdge, deleteEdge

Rules:
- Only use these node shapes: ${ALLOWED_SHAPES.join(", ")}
- Only use these node fill colors: ${ALLOWED_NODE_COLORS.join(", ")}
- Snap positions to a 20px grid
- Space nodes at least 80px apart; stack layers about 180–220px vertically
- Prefer rectangles for services, cylinders for datastores, pills for gateways/entry points, diamonds for decisions, hexagons for external systems, circles for users or small actors
- Reuse existing node ids when extending the current graph; do not recreate the whole diagram unless the user asks to replace it
- Give every new node and edge a stable unique id
- Add nodes before the edges that connect them
- Edge labels should be short (HTTP, events, gRPC, etc.)
- Keep diagrams readable and not overcrowded
- Call as many tools as needed in each step, then stop when the diagram is complete`,
        prompt: `User request:\n${prompt}\n\nCurrent canvas:\n${JSON.stringify(graph)}`,
      });

      const actionCount = getAppliedCount();
      if (actionCount === 0) {
        throw new Error("Gemini did not call any canvas tools");
      }

      await publishAiStatus(roomId, "Design complete");
      logger.log("Design agent finished", {
        roomId,
        actionCount,
        ms: Date.now() - startedAt,
        usage: result.usage,
        summary: result.text,
      });

      return {
        roomId,
        summary: result.text,
        actionCount,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Design generation failed";
      logger.error("Design agent failed", { roomId, message });

      try {
        await publishAiStatus(roomId, "Design generation failed");
      } catch (statusError) {
        logger.error("Failed to publish error status", { statusError });
      }

      throw new AbortTaskRunError(message);
    } finally {
      try {
        await clearAiPresence(roomId);
      } catch (presenceError) {
        logger.error("Failed to clear AI presence", { presenceError });
      }
    }
  },
});
