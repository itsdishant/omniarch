import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { AbortTaskRunError, logger, task, tasks } from "@trigger.dev/sdk";
import { generateText } from "ai";
import { put } from "@vercel/blob";
import { z } from "zod";

import { readCanvasGraph } from "@/lib/canvas-flow";
import { publishAiStatus } from "@/lib/ai-status";
import { ensureLiveblocksRoom } from "@/lib/liveblocks";
import { prisma } from "@/lib/prisma";
import { specGenerationPayloadSchema } from "@/types/spec";
import type { cleanupBlobsTask } from "@/trigger/cleanup-blobs";

// Limits to prevent excessive prompt sizes and provider context limits
const MAX_NODES = 200;
const MAX_EDGES = 300;
const MAX_LABEL_LENGTH = 200;
const MAX_PROMPT_CHARS = 100_000;

function truncateGraph(graph: { nodes: unknown[]; edges: unknown[] }) {
  const nodes = graph.nodes.slice(0, MAX_NODES);
  const edges = graph.edges.slice(0, MAX_EDGES);

  // Truncate long labels in nodes
  const truncatedNodes = nodes.map((node): Record<string, unknown> => {
    const n = { ...(node as Record<string, unknown>) };
    if (typeof n.data === "object" && n.data !== null) {
      const data = n.data as Record<string, unknown>;
      if (
        typeof data.label === "string" &&
        data.label.length > MAX_LABEL_LENGTH
      ) {
        data.label = data.label.slice(0, MAX_LABEL_LENGTH) + "…";
      }
    }
    return n;
  });

  // Truncate long labels in edges
  const truncatedEdges = edges.map((edge): Record<string, unknown> => {
    const e = { ...(edge as Record<string, unknown>) };
    if (typeof e.data === "object" && e.data !== null) {
      const data = e.data as Record<string, unknown>;
      if (
        typeof data.label === "string" &&
        data.label.length > MAX_LABEL_LENGTH
      ) {
        data.label = data.label.slice(0, MAX_LABEL_LENGTH) + "…";
      }
    }
    return e;
  });

  return { nodes: truncatedNodes, edges: truncatedEdges };
}

function truncatePrompt(prompt: string) {
  if (prompt.length <= MAX_PROMPT_CHARS) return prompt;
  return prompt.slice(0, MAX_PROMPT_CHARS) + "\n\n[TRUNCATED]";
}

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
        prompt: truncatePrompt(
          `Canvas Graph:
${JSON.stringify(truncateGraph({ nodes: graph.nodes, edges: graph.edges }), null, 2)}

Chat History:
${JSON.stringify(chatHistory, null, 2)}`,
        ),
      });

      await publishAiStatus(roomId, "Saving technical specification…");

      const specId = crypto.randomUUID();
      const blobPath = `specs/${roomId}/${specId}.md`;
      let blobUrl: string;
      try {
        const blob = await put(blobPath, result.text, {
          access: "private",
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: "text/markdown; charset=utf-8",
          cacheControlMaxAge: 60,
        });
        blobUrl = blob.url;
      } catch (uploadError) {
        logger.error("Failed to upload spec to Blob", {
          roomId,
          error: uploadError,
        });
        throw new AbortTaskRunError("Failed to save specification");
      }

      // Enqueue cleanup task BEFORE DB upsert so cleanup is durable even if upsert fails
      await tasks.trigger<typeof cleanupBlobsTask>("cleanup-blobs", {
        blobUrls: [blobUrl],
      });

      try {
        await prisma.projectSpec.upsert({
          where: { id: specId },
          create: { id: specId, projectId: roomId, filePath: blobUrl },
          update: { filePath: blobUrl },
        });
      } catch {
        // Cleanup already enqueued; abort to mark run as failed
        throw new AbortTaskRunError("Failed to persist specification metadata");
      }

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
        filePath: blobUrl,
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
