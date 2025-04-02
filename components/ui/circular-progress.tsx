"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

interface CircularProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
  max?: number;
  size?: number;
  thickness?: number;
  color?: string;
  trackColor?: string;
}

const CircularProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  CircularProgressProps
>(
  (
    {
      className,
      value = 0,
      max = 100,
      size = 100,
      thickness = 4,
      color = "rgba(152, 252, 228, 1)",
      trackColor = "rgba(152, 252, 228, 0.1)",
      ...props
    },
    ref
  ) => {
    // Calculate properties for SVG circle
    const radius = size / 2 - thickness;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / max) * circumference;

    return (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={thickness}
          />

          {/* Progress indicator */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
      </ProgressPrimitive.Root>
    );
  }
);

CircularProgress.displayName = "CircularProgress";

export { CircularProgress };
