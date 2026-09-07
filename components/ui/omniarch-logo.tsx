import React from "react";
import { cn } from "@/lib/utils";

export interface OmniArchLogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: "icon" | "full" | "text";
  size?: number | "sm" | "md" | "lg" | "xl";
  className?: string;
  showTagline?: boolean;
}

const sizeMap = {
  sm: { icon: 24, text: "text-sm", tagline: "text-[8px]" },
  md: { icon: 32, text: "text-base", tagline: "text-[9px]" },
  lg: { icon: 40, text: "text-lg", tagline: "text-[10px]" },
  xl: { icon: 56, text: "text-2xl", tagline: "text-xs" },
};

export function OmniArchLogo({
  variant = "full",
  size = "md",
  className,
  showTagline = true,
  ...props
}: OmniArchLogoProps) {
  if (variant === "icon") {
    const dim = typeof size === "number" ? size : sizeMap[size].icon;
    return (
      <svg
        viewBox="0 0 128 128"
        width={dim}
        height={dim}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0 select-none", className)}
        aria-label="OmniArch Logo"
        {...props}
      >
        <defs>
          <radialGradient id="omni-glow-comp" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#00C8D4" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#6457F9" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#080809" stopOpacity="0" />
          </radialGradient>

          <linearGradient
            id="omni-arch-left-comp"
            x1="20%"
            y1="10%"
            x2="80%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#00F2FE" />
            <stop offset="50%" stopColor="#00C8D4" />
            <stop offset="100%" stopColor="#1A3B5C" />
          </linearGradient>

          <linearGradient
            id="omni-arch-right-comp"
            x1="20%"
            y1="0%"
            x2="90%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#8B82FF" />
            <stop offset="50%" stopColor="#6457F9" />
            <stop offset="100%" stopColor="#2D1A4E" />
          </linearGradient>

          <linearGradient
            id="omni-arch-top-comp"
            x1="0%"
            y1="50%"
            x2="100%"
            y2="50%"
          >
            <stop offset="0%" stopColor="#00F2FE" />
            <stop offset="50%" stopColor="#7B61FF" />
            <stop offset="100%" stopColor="#9E8CFC" />
          </linearGradient>

          <linearGradient
            id="omni-core-ring-comp"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#00C8D4" />
            <stop offset="50%" stopColor="#6457F9" />
            <stop offset="100%" stopColor="#FF3B81" />
          </linearGradient>

          <filter
            id="omni-drop-shadow-comp"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="6"
              floodColor="#000000"
              floodOpacity="0.4"
            />
          </filter>
        </defs>

        <rect width="128" height="128" rx="28" fill="#111114" />
        <rect width="128" height="128" rx="28" fill="url(#omni-glow-comp)" />
        <rect
          width="126"
          height="126"
          x="1"
          y="1"
          rx="27"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1.5"
        />

        <g
          opacity="0.12"
          stroke="#FFFFFF"
          strokeWidth="0.75"
          strokeDasharray="2 3"
        >
          <line x1="24" y1="24" x2="104" y2="24" />
          <line x1="24" y1="64" x2="104" y2="64" />
          <line x1="24" y1="104" x2="104" y2="104" />
          <line x1="24" y1="24" x2="24" y2="104" />
          <line x1="64" y1="24" x2="64" y2="104" />
          <line x1="104" y1="24" x2="104" y2="104" />
        </g>

        <g filter="url(#omni-drop-shadow-comp)">
          <path
            d="M42 34 L64 22 L86 34 L76 42 L64 35 L52 42 Z"
            fill="url(#omni-arch-top-comp)"
          />
          <path
            d="M42 34 L52 42 L38 68 L26 64 Z"
            fill="url(#omni-arch-left-comp)"
            opacity="0.95"
          />
          <path
            d="M26 64 L38 68 L38 90 L26 84 Z"
            fill="#00A2AC"
            opacity="0.8"
          />
          <path
            d="M38 68 L50 74 L50 96 L38 90 Z"
            fill="url(#omni-arch-left-comp)"
          />

          <path
            d="M86 34 L76 42 L90 68 L102 64 Z"
            fill="url(#omni-arch-right-comp)"
            opacity="0.95"
          />
          <path
            d="M102 64 L90 68 L90 90 L102 84 Z"
            fill="#4B3DB8"
            opacity="0.8"
          />
          <path
            d="M90 68 L78 74 L78 96 L90 90 Z"
            fill="url(#omni-arch-right-comp)"
          />

          <polygon
            points="64,48 78,57 64,66 50,57"
            fill="#18181C"
            stroke="url(#omni-core-ring-comp)"
            strokeWidth="2.5"
          />

          <line
            x1="64"
            y1="35"
            x2="64"
            y2="48"
            stroke="#00F2FE"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="50"
            y1="57"
            x2="38"
            y2="68"
            stroke="#00C8D4"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="78"
            y1="57"
            x2="90"
            y2="68"
            stroke="#8B82FF"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="64"
            y1="66"
            x2="64"
            y2="85"
            stroke="#6457F9"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="3 3"
          />

          <path
            d="M50 74 L64 66 L78 74"
            fill="none"
            stroke="url(#omni-arch-top-comp)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          <circle cx="64" cy="22" r="3.5" fill="#FFFFFF" />
          <circle cx="26" cy="64" r="3.5" fill="#00F2FE" />
          <circle cx="102" cy="64" r="3.5" fill="#8B82FF" />
          <circle
            cx="64"
            cy="57"
            r="4"
            fill="#FFFFFF"
            stroke="#6457F9"
            strokeWidth="1.5"
          />
          <circle cx="50" cy="96" r="3" fill="#00C8D4" />
          <circle cx="78" cy="96" r="3" fill="#6457F9" />
        </g>
      </svg>
    );
  }

  const config =
    typeof size === "number"
      ? { icon: size, text: "text-base", tagline: "text-[9px]" }
      : sizeMap[size];

  return (
    <div
      className={cn("inline-flex items-center gap-2.5 select-none", className)}
    >
      <OmniArchLogo variant="icon" size={config.icon} />
      <div className="flex flex-col justify-center">
        <span
          className={cn(
            "font-heading font-bold tracking-tight text-copy-primary leading-none",
            config.text,
          )}
        >
          Omni<span className="text-brand">Arch</span>
        </span>
        {showTagline && (
          <span
            className={cn(
              "font-mono tracking-widest text-copy-muted uppercase mt-0.5 leading-none",
              config.tagline,
            )}
          >
            AI System Canvas
          </span>
        )}
      </div>
    </div>
  );
}

export default OmniArchLogo;
