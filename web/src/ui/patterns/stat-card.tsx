/**
 * @file StatCard component
 *
 * Statistics display card with icon and trend.
 */

import { type ReactNode } from "react";
import { cn } from "@/lib";

// ============================================================================
// Types
// ============================================================================

export interface StatCardProps {
  /** Card title/label */
  label: string;
  /** Main value */
  value: string | number;
  /** Optional icon */
  icon?: ReactNode;
  /** Trend indicator (+/-) */
  trend?: {
    value: number;
    label?: string;
  };
  /** Color variant */
  variant?: "default" | "primary" | "success" | "warning" | "error";
  /** Additional class names */
  className?: string;
}

// ============================================================================
// Styles
// ============================================================================

const variantStyles = {
  default: {
    icon: "bg-muted text-muted-foreground",
    accent: "text-foreground",
  },
  primary: {
    icon: "bg-primary/10 text-primary",
    accent: "text-primary",
  },
  success: {
    icon: "bg-success/10 text-success",
    accent: "text-success",
  },
  warning: {
    icon: "bg-warning/10 text-warning",
    accent: "text-warning",
  },
  error: {
    icon: "bg-error/10 text-error",
    accent: "text-error",
  },
} as const;

// ============================================================================
// Component
// ============================================================================

export function StatCard({
  label,
  value,
  icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];
  const trendPositive = trend && trend.value >= 0;

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4",
        "flex items-start gap-4",
        className
      )}
    >
      {/* Icon */}
      {icon && (
        <div className={cn("p-2.5 rounded-lg shrink-0", styles.icon)}>
          {icon}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground truncate">{label}</p>
        <p className={cn("text-2xl font-semibold mt-0.5", styles.accent)}>
          {value}
        </p>

        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            <span
              className={cn(
                "text-xs font-medium",
                trendPositive ? "text-success" : "text-error"
              )}
            >
              {trendPositive ? "+" : ""}
              {trend.value}%
            </span>
            {trend.label && (
              <span className="text-xs text-muted-foreground">
                {trend.label}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MiniStat (compact inline version)
// ============================================================================

export interface MiniStatProps {
  label: string;
  value: string | number;
  className?: string;
}

export function MiniStat({ label, value, className }: MiniStatProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className="text-xs font-medium text-foreground">{value}</span>
    </div>
  );
}
