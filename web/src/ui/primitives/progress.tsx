/**
 * @file Progress component
 *
 * Progress bar indicator.
 */

import { cn } from "@/lib";

// ============================================================================
// Types
// ============================================================================

export interface ProgressProps {
  /** Progress value (0-100) */
  value: number;
  /** Maximum value */
  max?: number;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Color variant */
  variant?: "default" | "success" | "warning" | "error";
  /** Show percentage label */
  showLabel?: boolean;
  /** Indeterminate state (animated) */
  indeterminate?: boolean;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// Styles
// ============================================================================

const sizeStyles = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
} as const;

const variantStyles = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
} as const;

// ============================================================================
// Component
// ============================================================================

export function Progress({
  value,
  max = 100,
  size = "md",
  variant = "default",
  showLabel = false,
  indeterminate = false,
  className,
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("space-y-1", className)}>
      {/* Label */}
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{indeterminate ? "..." : `${Math.round(percentage)}%`}</span>
        </div>
      )}

      {/* Track */}
      <div
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(
          "w-full rounded-full bg-border overflow-hidden",
          sizeStyles[size]
        )}
      >
        {/* Bar */}
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            variantStyles[variant],
            indeterminate && "animate-progress-indeterminate"
          )}
          style={{
            width: indeterminate ? "50%" : `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Spinner
// ============================================================================

export interface SpinnerProps {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional class names */
  className?: string;
}

const spinnerSizes = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-8 border-3",
} as const;

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "rounded-full border-current border-t-transparent animate-spin",
        spinnerSizes[size],
        className
      )}
    />
  );
}
