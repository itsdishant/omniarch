import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { AbortTaskRunError, logger, task } from "@trigger.dev/sdk";
import { generateText } from "ai";
import { put } from "@vercel/blob";
import { z } from "zod";

import { readCanvasGraph } from "@/lib/canvas-flow";
import { publishAiStatus } from "@/lib/ai-status";
import { ensureLiveblocksRoom } from "@/lib/liveblocks";
import { prisma } from "@/lib/prisma";
import { specGenerationPayloadSchema } from "@/types/spec";

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

export const generateSpecTask = task({
  id: "generate-spec",
  retry: { maxAttempts: 1 },
  run: async (payload: z.infer<typeof specGenerationPayloadSchema>) => {
    const { roomId, chatHistory, nodes, edges } = payload;
    logger.log("Spec generation started", {
      roomId,
      nodeCount: nodes.length,
      edgeCount: edges.length,
    });

    await ensureLiveblocksRoom(roomId);

    try {
      await publishAiStatus(roomId, "Starting spec generation…");
      await publishAiStatus(roomId, "Reading canvas graph…");

      const graph = await readCanvasGraph(roomId);

      await publishAiStatus(roomId, "Generating technical specification…");

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
        system: `You are OmniArch, a technical specification writer.
Generate a comprehensive Markdown technical specification from the provided canvas graph and chat history.

The canvas represents a system architecture diagram with nodes (components/services) and edges (connections/relationships).
The chat history contains the collaborative discussion that led to this design.

Your output must be valid Markdown. Structure the spec as follows:

# Technical Specification

## Overview
Brief description of the system based on the canvas and chat context.

## Architecture
Describe the overall architecture pattern and key design decisions.

## Components
List each component from the canvas with:
- Name (node label)
- Type (node shape: rectangle=service, cylinder=datastore, pill=gateway, diamond=decision, hexagon=external, circle=user)
- Description (inferred from connections and chat context)

## Data Flow
Describe how data flows through the system based on edges and their labels.

## Interfaces
List key interfaces/APIs between components (from edge labels and connected nodes).

## Infrastructure
Note any infrastructure components (databases, message queues, caches, etc.).

## Non-Functional Requirements
Address scalability, reliability, security, and observability based on the architecture.

## Assumptions & Constraints
Document any assumptions made during spec generation.

Keep the tone professional and technical. Be specific to the actual canvas content, not generic.`,
        prompt: `Canvas Graph:
${JSON.stringify({ nodes: graph.nodes, edges: graph.edges }, null, 2)}

Chat History:
${JSON.stringify(chatHistory, null, 2)}`,
      });

      await publishAiStatus(roomId, "Saving technical specification…");

      const specId = crypto.randomUUID();
      const blob = await put(`specs/${roomId}/${specId}.md`, result.text, {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "text/markdown; charset=utf-8",
        cacheControlMaxAge: 60,
      });

      await prisma.projectSpec.upsert({
        where: { id: specId },
        create: { id: specId, projectId: roomId, filePath: blob.url },
        update: { filePath: blob.url },
      });

      await publishAiStatus(roomId, "Spec generation complete");

      logger.log("Spec generation finished", {
        roomId,
        ms: Date.now() - startedAt,
        usage: result.usage,
        summaryLength: result.text.length,
      });

      return {
        roomId,
        specId,
        filePath: blob.url,
        spec: result.text,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Spec generation failed";
      logger.error("Spec generation failed", { roomId, message });

      try {
        await publishAiStatus(roomId, "Spec generation failed");
      } catch (statusError) {
        logger.error("Failed to publish error status", { statusError });
      }

      throw new AbortTaskRunError(message);
    }
  },
});
