import { tool } from "ai";
import { z } from "zod";

import { updateAiPresence } from "@/lib/ai-presence";
import {
  ALLOWED_SHAPES,
  applyDesignActions,
  sanitizeDesignActions,
  type DesignAction,
} from "@/lib/canvas-flow";

const shapeSchema = z
  .enum(ALLOWED_SHAPES)
  .describe(
    "Node shape: rectangle, diamond, circle, pill, cylinder, or hexagon",
  );

export function createDesignCanvasTools(roomId: string) {
  const applied: DesignAction[] = [];
  let queue: Promise<boolean> = Promise.resolve(true);

  async function runAction(action: DesignAction) {
    const [sanitized] = sanitizeDesignActions([action]);
    if (!sanitized) {
      return { ok: false as const, reason: "invalid action" };
    }

    queue = queue.then(async () => {
      const didApply = await applyDesignActions(roomId, [sanitized]);
      if (!didApply) return false;

      applied.push(sanitized);
      if (sanitized.type === "add_node" || sanitized.type === "move_node") {
        await updateAiPresence(
          roomId,
          { cursor: { x: sanitized.x, y: sanitized.y }, thinking: true },
          180,
        );
      }
      return true;
    });
    const didApply = await queue;

    if (!didApply) {
      return { ok: false as const, reason: "Operation could not be applied" };
    }

    return { ok: true as const, id: sanitized.id };
  }

  const tools = {
    addNode: tool({
      description: "Add a node to the collaborative architecture canvas.",
      inputSchema: z.object({
        id: z.string().describe("Stable unique node id"),
        shape: shapeSchema,
        x: z.number().describe("X position on the 20px grid"),
        y: z.number().describe("Y position on the 20px grid"),
        label: z.string().describe("Visible node label"),
        color: z.string().optional().describe("Fill color from the palette"),
        width: z.number().optional(),
        height: z.number().optional(),
      }),
      execute: async (input) =>
        runAction({
          type: "add_node",
          id: input.id,
          shape: input.shape,
          x: input.x,
          y: input.y,
          label: input.label,
          color: input.color,
          width: input.width,
          height: input.height,
        }),
    }),
    moveNode: tool({
      description: "Move an existing canvas node.",
      inputSchema: z.object({
        id: z.string(),
        x: z.number(),
        y: z.number(),
      }),
      execute: async (input) =>
        runAction({
          type: "move_node",
          id: input.id,
          x: input.x,
          y: input.y,
        }),
    }),
    resizeNode: tool({
      description: "Resize an existing canvas node.",
      inputSchema: z.object({
        id: z.string(),
        width: z.number(),
        height: z.number(),
      }),
      execute: async (input) =>
        runAction({
          type: "resize_node",
          id: input.id,
          width: input.width,
          height: input.height,
        }),
    }),
    updateNodeData: tool({
      description: "Update a node's label, color, or shape.",
      inputSchema: z.object({
        id: z.string(),
        label: z.string().optional(),
        color: z.string().optional(),
        shape: shapeSchema.optional(),
      }),
      execute: async (input) =>
        runAction({
          type: "update_node_data",
          id: input.id,
          label: input.label,
          color: input.color,
          shape: input.shape,
        }),
    }),
    deleteNode: tool({
      description: "Delete a node and its connected edges.",
      inputSchema: z.object({
        id: z.string(),
      }),
      execute: async (input) =>
        runAction({ type: "delete_node", id: input.id }),
    }),
    addEdge: tool({
      description: "Connect two nodes with an edge.",
      inputSchema: z.object({
        id: z.string().describe("Stable unique edge id"),
        source: z.string().describe("Source node id"),
        target: z.string().describe("Target node id"),
        label: z.string().optional().describe("Short edge label such as HTTP"),
      }),
      execute: async (input) =>
        runAction({
          type: "add_edge",
          id: input.id,
          source: input.source,
          target: input.target,
          label: input.label,
        }),
    }),
    deleteEdge: tool({
      description: "Delete an edge.",
      inputSchema: z.object({
        id: z.string(),
      }),
      execute: async (input) =>
        runAction({ type: "delete_edge", id: input.id }),
    }),
  };

  return {
    tools,
    getAppliedCount: () => applied.length,
  };
}
