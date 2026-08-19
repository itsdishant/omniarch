import { z } from "zod";
import { CanvasNodeDataSchema, CanvasEdgeDataSchema } from "@/types/canvas";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.number(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const canvasNodeSchema = z.object({
  id: z.string(),
  type: z.literal("canvasNode"),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  width: z.number().optional(),
  height: z.number().optional(),
  data: CanvasNodeDataSchema,
});

export const canvasEdgeSchema = z.object({
  id: z.string(),
  type: z.literal("canvasEdge"),
  source: z.string(),
  target: z.string(),
  data: CanvasEdgeDataSchema,
  markerEnd: z.object({
    type: z.string(),
    color: z.string(),
    width: z.number(),
    height: z.number(),
  }).optional(),
  style: z.object({
    stroke: z.string(),
    strokeWidth: z.number(),
    strokeLinecap: z.string(),
  }).optional(),
});

export const specGenerationPayloadSchema = z.object({
  roomId: z.string().min(1),
  chatHistory: z.array(chatMessageSchema),
  nodes: z.array(canvasNodeSchema),
  edges: z.array(canvasEdgeSchema),
});

export type SpecGenerationPayload = z.infer<typeof specGenerationPayloadSchema>;