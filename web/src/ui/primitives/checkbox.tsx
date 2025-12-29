/**
 * @file Checkbox component
 *
 * Checkbox primitive with label support.
 */

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib";

// ============================================================================
// Types
// ============================================================================

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
}

// ============================================================================
// Component
// ============================================================================

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <label
        className={cn(
          "inline-flex items-center gap-2 cursor-pointer",
          className
        )}
      >
        <span className="relative inline-flex items-center justify-center">
          <input
            ref={ref}
            type="checkbox"
            className="peer sr-only"
            {...props}
          />
          {/* Box */}
          <span
            className={cn(
              "size-4 rounded border-2 border-border",
              "transition-colors duration-150",
              "peer-checked:bg-primary peer-checked:border-primary",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
              "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
            )}
          />
          {/* Check */}
          <svg
            className={cn(
              "absolute size-3 text-primary-foreground",
              "opacity-0 peer-checked:opacity-100",
              "transition-opacity duration-150"
            )}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        {label && <span className="text-sm text-foreground">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
