/**
 * @file Step wrapper component
 *
 * Unified wrapper component for pipeline steps.
 * Supports both collapsible (with configuration) and simple (toggle-only) variants.
 */

"use client";

import { type ReactNode } from "react";
import { Collapsible, Switch } from "@/ui/primitives";
import { cn } from "@/lib";

// ============================================================================
// Types
// ============================================================================

interface StepWrapperBaseProps {
  /** Step icon */
  icon: ReactNode;
  /** Step title */
  title: string;
  /** Whether step is enabled */
  enabled: boolean;
  /** Callback when enabled state changes */
  onToggle: (enabled: boolean) => void;
}

interface CollapsibleStepProps extends StepWrapperBaseProps {
  /** Variant: collapsible with content */
  variant?: "collapsible";
  /** Step configuration content */
  children: ReactNode;
  /** Reset to defaults handler */
  onReset?: () => void;
}

interface SimpleStepProps extends StepWrapperBaseProps {
  /** Variant: simple toggle-only */
  variant: "simple";
  /** No children for simple variant */
  children?: never;
  /** No reset for simple variant */
  onReset?: never;
}

export type StepWrapperProps = CollapsibleStepProps | SimpleStepProps;

// ============================================================================
// Step Header (internal)
// ============================================================================

function StepHeader({
  icon,
  title,
  enabled,
  onToggle,
  showChevronSpace = false,
}: StepWrapperBaseProps & { showChevronSpace?: boolean }) {
  return (
    <div className="flex items-center gap-3 w-full">
      <span
        className={cn(
          "transition-colors duration-150",
          enabled ? "text-primary" : "text-muted-foreground"
        )}
      >
        {icon}
      </span>
      <span className="flex-1 font-medium text-sm">{title}</span>
      <Switch
        checked={enabled}
        onChange={(e) => onToggle(e.target.checked)}
        onClick={(e) => e.stopPropagation()}
      />
      {/* Spacer to align with collapsible chevron */}
      {showChevronSpace && <span className="size-4" />}
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

export function StepWrapper(props: StepWrapperProps) {
  const { icon, title, enabled, onToggle, variant = "collapsible" } = props;

  // Simple variant - just a toggle card without collapsible content
  if (variant === "simple") {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card">
        <StepHeader
          icon={icon}
          title={title}
          enabled={enabled}
          onToggle={onToggle}
          showChevronSpace
        />
      </div>
    );
  }

  // Collapsible variant - with configuration content
  const { children, onReset } = props as CollapsibleStepProps;

  return (
    <Collapsible
      title={
        <StepHeader
          icon={icon}
          title={title}
          enabled={enabled}
          onToggle={onToggle}
        />
      }
    >
      <div className="space-y-3">
        {children}

        {/* Reset button */}
        {onReset && (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={onReset}
          >
            Reset to defaults
          </button>
        )}
      </div>
    </Collapsible>
  );
}
