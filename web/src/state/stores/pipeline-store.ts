/**
 * @file Pipeline store
 *
 * State management for pipeline configuration.
 */

import { create } from "zustand";
import {
  type CleanSettings,
  type HydroSettings,
  type SolvateSettings,
  type TopologySettings,
  DEFAULT_CLEAN_SETTINGS,
  DEFAULT_HYDRO_SETTINGS,
  DEFAULT_SOLVATE_SETTINGS,
  DEFAULT_TOPOLOGY_SETTINGS,
} from "@/core";

// ============================================================================
// Types
// ============================================================================

interface PipelineState {
  // Step enabled states
  cleanEnabled: boolean;
  repairEnabled: boolean;
  hydroEnabled: boolean;
  solvateEnabled: boolean;
  topologyEnabled: boolean;

  // Step configurations
  cleanConfig: CleanSettings;
  hydroConfig: HydroSettings;
  solvateConfig: SolvateSettings;
  topologyConfig: TopologySettings;
}

interface PipelineActions {
  // Step toggles
  setCleanEnabled: (enabled: boolean) => void;
  setRepairEnabled: (enabled: boolean) => void;
  setHydroEnabled: (enabled: boolean) => void;
  setSolvateEnabled: (enabled: boolean) => void;
  setTopologyEnabled: (enabled: boolean) => void;

  // Settings updates
  setCleanConfig: (config: Partial<CleanSettings>) => void;
  setHydroConfig: (config: Partial<HydroSettings>) => void;
  setSolvateConfig: (config: Partial<SolvateSettings>) => void;
  setTopologyConfig: (config: Partial<TopologySettings>) => void;

  // Reset
  resetAll: () => void;
}

export type PipelineStore = PipelineState & PipelineActions;

// ============================================================================
// Initial State
// ============================================================================

const initialState: PipelineState = {
  // Default enabled states
  cleanEnabled: true,
  repairEnabled: true,
  hydroEnabled: false,
  solvateEnabled: false,
  topologyEnabled: false,

  // Default configurations
  cleanConfig: { ...DEFAULT_CLEAN_SETTINGS },
  hydroConfig: { ...DEFAULT_HYDRO_SETTINGS },
  solvateConfig: { ...DEFAULT_SOLVATE_SETTINGS },
  topologyConfig: { ...DEFAULT_TOPOLOGY_SETTINGS },
};

// ============================================================================
// Store
// ============================================================================

export const usePipelineStore = create<PipelineStore>((set) => ({
  ...initialState,

  // Step toggles
  setCleanEnabled: (enabled) => set({ cleanEnabled: enabled }),
  setRepairEnabled: (enabled) => set({ repairEnabled: enabled }),
  setHydroEnabled: (enabled) => set({ hydroEnabled: enabled }),
  setSolvateEnabled: (enabled) => set({ solvateEnabled: enabled }),
  setTopologyEnabled: (enabled) => set({ topologyEnabled: enabled }),

  // Settings updates (merge with existing)
  setCleanConfig: (config) =>
    set((state) => ({
      cleanConfig: { ...state.cleanConfig, ...config },
    })),

  setHydroConfig: (config) =>
    set((state) => ({
      hydroConfig: { ...state.hydroConfig, ...config },
    })),

  setSolvateConfig: (config) =>
    set((state) => ({
      solvateConfig: { ...state.solvateConfig, ...config },
    })),

  setTopologyConfig: (config) =>
    set((state) => ({
      topologyConfig: { ...state.topologyConfig, ...config },
    })),

  // Reset all to defaults
  resetAll: () => set(initialState),
}));

// ============================================================================
// Selectors
// ============================================================================

/** Select clean config (enabled + settings) */
export const selectCleanConfig = (state: PipelineState) => ({
  enabled: state.cleanEnabled,
  settings: state.cleanConfig,
});

/** Select repair config (enabled only) */
export const selectRepairConfig = (state: PipelineState) => ({
  enabled: state.repairEnabled,
});

/** Select hydro config (enabled + settings) */
export const selectHydroConfig = (state: PipelineState) => ({
  enabled: state.hydroEnabled,
  settings: state.hydroConfig,
});

/** Select solvate config (enabled + settings) */
export const selectSolvateConfig = (state: PipelineState) => ({
  enabled: state.solvateEnabled,
  settings: state.solvateConfig,
});

/** Select topology config (enabled + settings) */
export const selectTopologyConfig = (state: PipelineState) => ({
  enabled: state.topologyEnabled,
  settings: state.topologyConfig,
});
