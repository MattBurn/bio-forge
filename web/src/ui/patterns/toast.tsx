/**
 * @file Toast component
 *
 * Toast notification system with container.
 */

"use client";

import { type ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib";
import { useToastStore, type Toast } from "@/state";
import {
  CheckCircleIcon,
  AlertCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  XIcon,
} from "@/ui/icons";

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_DURATION = 4000; // ms

// ============================================================================
// Icons Mapping
// ============================================================================

const icons: Record<Toast["type"], ReactNode> = {
  success: <CheckCircleIcon className="size-5" />,
  error: <AlertCircleIcon className="size-5" />,
  warning: <AlertTriangleIcon className="size-5" />,
  info: <InfoIcon className="size-5" />,
};

// ============================================================================
// Styles
// ============================================================================

const typeStyles: Record<Toast["type"], string> = {
  success: "bg-success/10 text-success border-success/20",
  error: "bg-error/10 text-error border-error/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  info: "bg-info/10 text-info border-info/20",
};

// ============================================================================
// Toast Item
// ============================================================================

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  // Auto-dismiss after duration
  useEffect(() => {
    const duration = toast.duration ?? DEFAULT_DURATION;
    if (duration <= 0) return; // 0 or negative means no auto-dismiss

    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3",
        "rounded-lg border shadow-lg backdrop-blur-sm",
        "min-w-75 max-w-100",
        typeStyles[toast.type]
      )}
    >
      {/* Icon */}
      <span className="shrink-0">{icons[toast.type]}</span>

      {/* Message */}
      <p className="flex-1 text-sm font-medium">{toast.message}</p>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 p-1 rounded hover:bg-foreground/10 transition-colors"
      >
        <XIcon className="size-4" />
      </button>
    </motion.div>
  );
}

// ============================================================================
// Toast Container
// ============================================================================

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div className="fixed top-4 right-4 z-100 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
