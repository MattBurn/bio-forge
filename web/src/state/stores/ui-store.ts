/**
 * @file UI store
 *
 * State management for UI-specific state.
 */

import { create } from "zustand";

// ============================================================================
// Types
// ============================================================================

interface UIState {
  /** WASM module ready state */
  wasmReady: boolean;
  /** Processing in progress */
  isProcessing: boolean;
  /** Expanded file IDs for file cards */
  expandedFileIds: Set<string>;
  /** Sidebar open state (mobile) */
  sidebarOpen: boolean;
}

interface UIActions {
  setWasmReady: (ready: boolean) => void;
  setProcessing: (processing: boolean) => void;
  toggleFileExpanded: (id: string) => void;
  expandFile: (id: string) => void;
  collapseFile: (id: string) => void;
  collapseAllFiles: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

type UIStore = UIState & UIActions;

// ============================================================================
// Store
// ============================================================================

export const useUIStore = create<UIStore>((set) => ({
  // Initial state
  wasmReady: false,
  isProcessing: false,
  expandedFileIds: new Set(),
  sidebarOpen: false,

  // Actions
  setWasmReady: (wasmReady) => set({ wasmReady }),

  setProcessing: (isProcessing) => set({ isProcessing }),

  toggleFileExpanded: (id) =>
    set((state) => {
      const newExpandedIds = new Set(state.expandedFileIds);
      if (newExpandedIds.has(id)) {
        newExpandedIds.delete(id);
      } else {
        newExpandedIds.add(id);
      }
      return { expandedFileIds: newExpandedIds };
    }),

  expandFile: (id) =>
    set((state) => {
      const newExpandedIds = new Set(state.expandedFileIds);
      newExpandedIds.add(id);
      return { expandedFileIds: newExpandedIds };
    }),

  collapseFile: (id) =>
    set((state) => {
      const newExpandedIds = new Set(state.expandedFileIds);
      newExpandedIds.delete(id);
      return { expandedFileIds: newExpandedIds };
    }),

  collapseAllFiles: () => set({ expandedFileIds: new Set() }),

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));

// ============================================================================
// Selectors
// ============================================================================

export const selectIsFileExpanded = (id: string) => (state: UIStore) =>
  state.expandedFileIds.has(id);
