import { MarkerType } from "@xyflow/react";

import {
  DEFAULT_EDGE_COLOR,
  DEFAULT_EDGE_STROKE_WIDTH,
  DEFAULT_SHAPE_SIZES,
  NODE_COLORS,
  type CanvasEdge,
  type CanvasNode,
  type CanvasShape,
  type NodeColorPair,
} from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

function color(index: number): NodeColorPair {
  return NODE_COLORS[index] ?? NODE_COLORS[0];
}

function templateNode(
  id: string,
  shape: CanvasShape,
  x: number,
  y: number,
  label: string,
  pair: NodeColorPair,
): CanvasNode {
  const { width, height } = DEFAULT_SHAPE_SIZES[shape];

  return {
    id,
    type: "canvasNode",
    position: { x, y },
    width,
    height,
    data: {
      label,
      color: pair.fill,
      textColor: pair.text,
      shape,
    },
    style: { width, height },
  };
}

function templateEdge(
  id: string,
  source: string,
  target: string,
  label = "",
): CanvasEdge {
  return {
    id,
    source,
    target,
    type: "canvasEdge",
    data: { label },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: DEFAULT_EDGE_COLOR,
      width: 16,
      height: 16,
    },
    style: {
      stroke: DEFAULT_EDGE_COLOR,
      strokeWidth: DEFAULT_EDGE_STROKE_WIDTH,
      strokeLinecap: "round",
    },
  };
}

const microservices: CanvasTemplate = {
  id: "microservices",
  name: "Microservices",
  description:
    "API Gateway routes traffic to isolated services, each backed by a dedicated database and connected via a shared message bus.",
  nodes: [
    templateNode("ms-gateway", "pill", 380, 40, "API Gateway", color(1)),
    templateNode("ms-auth", "rectangle", 40, 220, "Auth Service", color(2)),
    templateNode(
      "ms-orders",
      "rectangle",
      380,
      220,
      "Orders Service",
      color(3),
    ),
    templateNode(
      "ms-catalog",
      "rectangle",
      720,
      220,
      "Catalog Service",
      color(6),
    ),
    templateNode("ms-auth-db", "cylinder", 70, 420, "Users DB", color(2)),
    templateNode("ms-orders-db", "cylinder", 410, 420, "Orders DB", color(3)),
    templateNode("ms-catalog-db", "cylinder", 750, 420, "Catalog DB", color(6)),
  ],
  edges: [
    templateEdge("ms-e-gateway-auth", "ms-gateway", "ms-auth", "HTTP"),
    templateEdge("ms-e-gateway-orders", "ms-gateway", "ms-orders", "HTTP"),
    templateEdge("ms-e-gateway-catalog", "ms-gateway", "ms-catalog", "HTTP"),
    templateEdge("ms-e-auth-db", "ms-auth", "ms-auth-db"),
    templateEdge("ms-e-orders-db", "ms-orders", "ms-orders-db"),
    templateEdge("ms-e-catalog-db", "ms-catalog", "ms-catalog-db"),
  ],
};

const cicd: CanvasTemplate = {
  id: "cicd-pipeline",
  name: "CI/CD Pipeline",
  description:
    "End-to-end delivery from source commit through build, test, containerisation, and staged deployment to production.",
  nodes: [
    templateNode("ci-repo", "rectangle", 40, 160, "Source", color(1)),
    templateNode("ci-build", "hexagon", 320, 145, "Build", color(3)),
    templateNode("ci-test", "diamond", 560, 130, "Test", color(4)),
    templateNode("ci-staging", "circle", 820, 160, "Staging", color(6)),
    templateNode("ci-prod", "pill", 1040, 170, "Production", color(7)),
  ],
  edges: [
    templateEdge("ci-e-repo-build", "ci-repo", "ci-build"),
    templateEdge("ci-e-build-test", "ci-build", "ci-test"),
    templateEdge("ci-e-test-staging", "ci-test", "ci-staging"),
    templateEdge("ci-e-staging-prod", "ci-staging", "ci-prod", "promote"),
  ],
};

const eventDriven: CanvasTemplate = {
  id: "event-driven",
  name: "Event-Driven System",
  description:
    "Producers publish events to a central bus. Independent consumers handle emails, push notifications, analytics, and error queues.",
  nodes: [
    templateNode("ed-producer-a", "rectangle", 40, 80, "Checkout", color(3)),
    templateNode("ed-producer-b", "rectangle", 40, 280, "Inventory", color(6)),
    templateNode("ed-bus", "hexagon", 380, 165, "Event Bus", color(1)),
    templateNode("ed-consumer-a", "rectangle", 680, 40, "Email", color(2)),
    templateNode("ed-consumer-b", "rectangle", 680, 180, "Analytics", color(5)),
    templateNode(
      "ed-consumer-c",
      "rectangle",
      680,
      320,
      "Fulfillment",
      color(7),
    ),
  ],
  edges: [
    templateEdge("ed-e-pa-bus", "ed-producer-a", "ed-bus", "order.placed"),
    templateEdge("ed-e-pb-bus", "ed-producer-b", "ed-bus", "stock.updated"),
    templateEdge("ed-e-bus-ca", "ed-bus", "ed-consumer-a"),
    templateEdge("ed-e-bus-cb", "ed-bus", "ed-consumer-b"),
    templateEdge("ed-e-bus-cc", "ed-bus", "ed-consumer-c"),
  ],
};

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  microservices,
  cicd,
  eventDriven,
];
