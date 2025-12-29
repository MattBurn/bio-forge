/**
 * @file Card component
 *
 * Container primitive for grouped content.
 */

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib";

// ============================================================================
// Types
// ============================================================================

export type CardVariant = "default" | "bordered" | "elevated";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

// ============================================================================
// Styles
// ============================================================================

const variantStyles: Record<CardVariant, string> = {
  default: "bg-card border border-border/50",
  bordered: "bg-card border border-border",
  elevated: "bg-card shadow-lg border border-border/30",
};

// ============================================================================
// Component
// ============================================================================

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("rounded-xl", variantStyles[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// ============================================================================
// Sub-components
// ============================================================================

export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-4 py-3 border-b border-border", className)}
    {...props}
  />
));

CardHeader.displayName = "CardHeader";

export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4", className)} {...props} />
));

CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-4 py-3 border-t border-border", className)}
    {...props}
  />
));

CardFooter.displayName = "CardFooter";
