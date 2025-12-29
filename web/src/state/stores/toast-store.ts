/**
 * @file Toast store
 *
 * State management for toast notifications.
 */

import { create } from "zustand";

// ============================================================================
// Types
// ============================================================================

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

interface ToastActions {
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

type ToastStore = ToastState & ToastActions;

// ============================================================================
// ID Generation
// ============================================================================

let toastIdCounter = 0;

function generateToastId(): string {
  return `toast-${Date.now()}-${++toastIdCounter}`;
}

// ============================================================================
// Store
// ============================================================================

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = generateToastId();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    return id;
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),
}));

// ============================================================================
// Convenience Functions
// ============================================================================

/** Show a success toast */
export function showSuccess(message: string, duration = 3000): string {
  return useToastStore
    .getState()
    .addToast({ type: "success", message, duration });
}

/** Show an error toast */
export function showError(message: string, duration = 5000): string {
  return useToastStore
    .getState()
    .addToast({ type: "error", message, duration });
}

/** Show a warning toast */
export function showWarning(message: string, duration = 4000): string {
  return useToastStore
    .getState()
    .addToast({ type: "warning", message, duration });
}

/** Show an info toast */
export function showInfo(message: string, duration = 3000): string {
  return useToastStore.getState().addToast({ type: "info", message, duration });
}
