/**
 * @file Switch component
 *
 * Toggle switch primitive.
 */

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib";

// ============================================================================
// Types
// ============================================================================

export interface SwitchProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
}

// ============================================================================
// Component
// ============================================================================

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, className, checked, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLLabelElement>) => {
      // Stop propagation to prevent parent elements from receiving the click
      e.stopPropagation();
    };

    return (
      <label
        className={cn(
          "inline-flex items-center gap-2 cursor-pointer",
          className
        )}
        onClick={handleClick}
      >
        <span className="relative inline-block">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            className="peer sr-only"
            onClick={onClick}
            {...props}
          />
          {/* Track */}
          <span
            className={cn(
              "block w-9 h-5 rounded-full transition-colors duration-150",
              "bg-muted peer-checked:bg-primary",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
              "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
            )}
          />
          {/* Thumb */}
          <span
            className={cn(
              "absolute top-0.5 left-0.5",
              "size-4 rounded-full bg-white",
              "transition-transform duration-150",
              "peer-checked:translate-x-4"
            )}
          />
        </span>
        {label && <span className="text-sm text-foreground">{label}</span>}
      </label>
    );
  }
);

Switch.displayName = "Switch";
