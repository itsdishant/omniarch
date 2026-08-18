"use client";

import { Download } from "lucide-react";

import { DialogPattern } from "@/components/editor/dialog-pattern";
import {
  CANVAS_TEMPLATES,
  type CanvasTemplate,
} from "@/components/editor/starter-templates";
import { Button } from "@/components/ui/button";
import { DEFAULT_SHAPE_SIZES, type CanvasEdge, type CanvasNode, type CanvasShape } from "@/types/canvas";

const PREVIEW_WIDTH = 280;
const PREVIEW_HEIGHT = 168;
const PREVIEW_PAD = 36;

interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (template: CanvasTemplate) => void;
}

function nodeSize(node: CanvasNode) {
  const defaults = DEFAULT_SHAPE_SIZES[node.data.shape];
  return {
    width: node.width ?? defaults.width,
    height: node.height ?? defaults.height,
  };
}

function templateBounds(nodes: CanvasNode[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    const { width, height } = nodeSize(node);
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + width);
    maxY = Math.max(maxY, node.position.y + height);
  }

  if (!Number.isFinite(minX)) {
    return { minX: 0, minY: 0, width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT };
  }

  return {
    minX,
    minY,
    width: Math.max(maxX - minX, 1),
    height: Math.max(maxY - minY, 1),
  };
}

function nodeCenter(node: CanvasNode) {
  const { width, height } = nodeSize(node);
  return {
    x: node.position.x + width / 2,
    y: node.position.y + height / 2,
  };
}

function PreviewShape({ node }: { node: CanvasNode }) {
  const { width, height } = nodeSize(node);
  const { x, y } = node.position;
  const fill = node.data.color;
  const shape: CanvasShape = node.data.shape;
  const stroke = "color-mix(in srgb, var(--text-primary) 28%, transparent)";

  if (shape === "circle") {
    const r = Math.min(width, height) / 2;
    return (
      <ellipse
        cx={x + width / 2}
        cy={y + height / 2}
        rx={r}
        ry={r}
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
      />
    );
  }

  if (shape === "pill") {
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={height / 2}
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
      />
    );
  }

  if (shape === "diamond") {
    const cx = x + width / 2;
    const cy = y + height / 2;
    return (
      <polygon
        points={`${cx},${y} ${x + width},${cy} ${cx},${y + height} ${x},${cy}`}
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
      />
    );
  }

  if (shape === "hexagon") {
    const inset = width * 0.18;
    return (
      <polygon
        points={`${x + inset},${y} ${x + width - inset},${y} ${x + width},${y + height / 2} ${x + width - inset},${y + height} ${x + inset},${y + height} ${x},${y + height / 2}`}
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
      />
    );
  }

  if (shape === "cylinder") {
    const ry = height * 0.14;
    return (
      <g>
        <rect x={x} y={y + ry} width={width} height={height - ry * 2} fill={fill} />
        <ellipse
          cx={x + width / 2}
          cy={y + height - ry}
          rx={width / 2}
          ry={ry}
          fill={fill}
          stroke={stroke}
          strokeWidth={2}
        />
        <ellipse
          cx={x + width / 2}
          cy={y + ry}
          rx={width / 2}
          ry={ry}
          fill={fill}
          stroke={stroke}
          strokeWidth={2}
        />
        <line x1={x} y1={y + ry} x2={x} y2={y + height - ry} stroke={stroke} strokeWidth={2} />
        <line
          x1={x + width}
          y1={y + ry}
          x2={x + width}
          y2={y + height - ry}
          stroke={stroke}
          strokeWidth={2}
        />
      </g>
    );
  }

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={10}
      fill={fill}
      stroke={stroke}
      strokeWidth={2}
    />
  );
}

function TemplatePreview({
  nodes,
  edges,
}: {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}) {
  const bounds = templateBounds(nodes);
  const viewW = bounds.width + PREVIEW_PAD * 2;
  const viewH = bounds.height + PREVIEW_PAD * 2;
  const nodesById = new Map(nodes.map((node) => [node.id, node]));

  return (
    <svg
      width={PREVIEW_WIDTH}
      height={PREVIEW_HEIGHT}
      viewBox={`${bounds.minX - PREVIEW_PAD} ${bounds.minY - PREVIEW_PAD} ${viewW} ${viewH}`}
      className="h-42 w-full bg-base"
      aria-hidden
    >
      {edges.map((edge) => {
        const source = nodesById.get(edge.source);
        const target = nodesById.get(edge.target);
        if (!source || !target) {
          return null;
        }
        const from = nodeCenter(source);
        const to = nodeCenter(target);
        return (
          <line
            key={edge.id}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="color-mix(in srgb, var(--text-primary) 40%, transparent)"
            strokeWidth={4}
            strokeLinecap="round"
          />
        );
      })}
      {nodes.map((node) => (
        <PreviewShape key={node.id} node={node} />
      ))}
    </svg>
  );
}

export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  function handleImport(template: CanvasTemplate) {
    onImport(template);
    onOpenChange(false);
  }

  return (
    <DialogPattern
      open={open}
      onOpenChange={onOpenChange}
      title="Import Template"
      description="Choose a starter template to pre-populate your canvas. Any existing nodes will be replaced."
      className="w-full max-w-5xl gap-6 p-8 sm:max-w-5xl [&_.absolute.top-2]:top-6 [&_.absolute.right-2]:right-6 [&_.absolute.top-2]:rounded-full [&_.absolute.top-2]:border [&_.absolute.top-2]:border-surface-border"
      titleClassName="text-2xl font-semibold tracking-tight"
      descriptionClassName="max-w-2xl text-[15px] leading-relaxed"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {CANVAS_TEMPLATES.map((template) => (
          <article
            key={template.id}
            className="flex flex-col rounded-2xl bg-subtle p-3"
          >
            <div className="overflow-hidden rounded-xl bg-base">
              <TemplatePreview nodes={template.nodes} edges={template.edges} />
            </div>
            <h3 className="mt-4 px-1 text-[15px] font-semibold text-copy-primary">
              {template.name}
            </h3>
            <p className="mt-1.5 flex-1 px-1 text-sm leading-relaxed text-copy-muted">
              {template.description}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 h-9 w-full rounded-xl border-surface-border bg-transparent text-copy-primary hover:bg-elevated"
              onClick={() => handleImport(template)}
            >
              <Download data-icon="inline-start" className="h-4 w-4" />
              Import
            </Button>
          </article>
        ))}
      </div>
    </DialogPattern>
  );
}
