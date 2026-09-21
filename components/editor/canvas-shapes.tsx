"use client";

import type { CanvasShape } from "@/types/canvas";
import { cn } from "@/lib/utils";
import { normalizeNodeLabel } from "@/lib/visible-text";

export interface ShapeVisualProps {
  width: number;
  height: number;
  fill: string;
  textColor: string;
  selected: boolean;
  label: string;
  hideLabel?: boolean;
}

function shapeStroke(selected: boolean) {
  return {
    borderWidth: selected ? "2px" : "1px",
    borderStyle: "solid" as const,
    borderColor: selected ? "var(--primary)" : "var(--surface-border)",
  };
}

function ShapeLabel({
  label,
  fallback,
  className,
}: {
  label: string;
  fallback: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "max-w-full overflow-hidden px-3 py-1.5 text-center text-sm leading-snug font-medium wrap-break-word whitespace-pre-wrap",
        className,
      )}
    >
      {normalizeNodeLabel(label) || fallback}
    </span>
  );
}

function RectangleShape({
  width,
  height,
  fill,
  textColor,
  selected,
  label,
  hideLabel,
}: ShapeVisualProps) {
  return (
    <div
      className="flex h-full w-full items-center justify-center rounded-md transition-all"
      style={{
        ...shapeStroke(selected),
        backgroundColor: fill,
        color: textColor,
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      {hideLabel ? null : <ShapeLabel label={label} fallback="Rectangle" />}
    </div>
  );
}

function PillShape({
  width,
  height,
  fill,
  textColor,
  selected,
  label,
  hideLabel,
}: ShapeVisualProps) {
  return (
    <div
      className="flex h-full w-full items-center justify-center transition-all"
      style={{
        borderRadius: "9999px",
        ...shapeStroke(selected),
        backgroundColor: fill,
        color: textColor,
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      {hideLabel ? null : (
        <ShapeLabel label={label} fallback="Pill" className="px-4" />
      )}
    </div>
  );
}

function CircleShape({
  width,
  height,
  fill,
  textColor,
  selected,
  label,
  hideLabel,
}: ShapeVisualProps) {
  return (
    <div
      className="flex h-full w-full items-center justify-center overflow-hidden transition-all"
      style={{
        borderRadius: "50%",
        ...shapeStroke(selected),
        backgroundColor: fill,
        color: textColor,
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      {hideLabel ? null : <ShapeLabel label={label} fallback="Circle" />}
    </div>
  );
}

function DiamondShape({
  width,
  height,
  fill,
  textColor,
  selected,
  label,
  hideLabel,
}: ShapeVisualProps) {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%" }}
      >
        <polygon
          points="50,2 98,50 50,98 2,50"
          fill={fill}
          stroke={selected ? "var(--primary)" : "var(--surface-border)"}
          strokeWidth={selected ? 2 : 1}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ color: textColor }}
      >
        {hideLabel ? null : (
          <ShapeLabel
            label={label}
            fallback="Diamond"
            className="max-w-[80%] px-2 py-1"
          />
        )}
      </div>
    </div>
  );
}

function HexagonShape({
  width,
  height,
  fill,
  textColor,
  selected,
  label,
  hideLabel,
}: ShapeVisualProps) {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%" }}
      >
        <polygon
          points="50,2 93,25 93,75 50,98 7,75 7,25"
          fill={fill}
          stroke={selected ? "var(--primary)" : "var(--surface-border)"}
          strokeWidth={selected ? 2 : 1}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ color: textColor }}
      >
        {hideLabel ? null : (
          <ShapeLabel
            label={label}
            fallback="Hexagon"
            className="max-w-[70%] px-2 py-1"
          />
        )}
      </div>
    </div>
  );
}

function CylinderShape({
  width,
  height,
  fill,
  textColor,
  selected,
  label,
  hideLabel,
}: ShapeVisualProps) {
  // Ellipse height as percentage of total height (12-15% looks good for cylinders)
  const ellipseRatio = 0.14;

  // In viewBox coordinates (0-100)
  const ry = ellipseRatio * 50; // radius Y in viewBox
  const topCy = ry; // top ellipse center Y
  const bottomCy = 100 - ry; // bottom ellipse center Y
  const bodyTopY = ry;
  const bodyBottomY = 100 - ry;
  const bodyHeightVb = bodyBottomY - bodyTopY;

  const strokeColor = selected ? "var(--primary)" : "var(--surface-border)";
  const strokeWidth = selected ? 2 : 1;
  const fillColor = fill;
  const topFillColor = `color-mix(in srgb, ${textColor} 14%, ${fill})`;

  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%" }}
      >
        {/* Bottom ellipse (drawn first, behind body) - only front arc visible */}
        <path
          d={`M 0 ${bottomCy} A 50 ${ry} 0 0 1 100 ${bottomCy} A 50 ${ry} 0 0 1 0 ${bottomCy}`}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />

        {/* Body sides - two vertical lines connecting ellipses */}
        <line
          x1="0"
          y1={bodyTopY}
          x2="0"
          y2={bodyBottomY}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        <line
          x1="100"
          y1={bodyTopY}
          x2="100"
          y2={bodyBottomY}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />

        {/* Body fill (between the side lines) */}
        <rect
          x="0"
          y={bodyTopY}
          width="100"
          height={bodyHeightVb}
          fill={fillColor}
          stroke="none"
        />

        {/* Top ellipse (drawn last, on top) - full ellipse with lighter fill for top face */}
        <ellipse
          cx="50"
          cy={topCy}
          rx="50"
          ry={ry}
          fill={topFillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />

        {/* Top ellipse front arc highlight (optional, for extra depth) */}
        <path
          d={`M 0 ${topCy} A 50 ${ry} 0 0 0 100 ${topCy}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          opacity="0.5"
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ color: textColor }}
      >
        {hideLabel ? null : (
          <ShapeLabel
            label={label}
            fallback="Cylinder"
            className="max-w-[70%] px-2 py-1"
          />
        )}
      </div>
    </div>
  );
}

export function renderShapeContent({
  shape,
  width,
  height,
  fill,
  textColor,
  selected,
  label,
  hideLabel,
}: {
  shape: CanvasShape;
  width: number;
  height: number;
  fill: string;
  textColor: string;
  selected: boolean;
  label: string;
  hideLabel?: boolean;
}) {
  const visual: ShapeVisualProps = {
    width,
    height,
    fill,
    textColor,
    selected,
    label,
    hideLabel,
  };

  switch (shape) {
    case "rectangle":
      return <RectangleShape {...visual} />;
    case "pill":
      return <PillShape {...visual} />;
    case "circle":
      return <CircleShape {...visual} />;
    case "diamond":
      return <DiamondShape {...visual} />;
    case "hexagon":
      return <HexagonShape {...visual} />;
    case "cylinder":
      return <CylinderShape {...visual} />;
  }
}
