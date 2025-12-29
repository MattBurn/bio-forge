/**
 * @file Core WASM module loader
 *
 * Provides a singleton pattern for loading and accessing the BioForge WASM module.
 * Handles initialization state and prevents multiple load attempts.
 */

import type {
  WasmModule,
  WasmStructure,
  WasmTopology,
  WasmTemplate,
} from "./types";

/** Module singleton state */
let wasmModule: WasmModule | null = null;
let initPromise: Promise<WasmModule> | null = null;

/**
 * Initialize the WASM module.
 *
 * Safe to call multiple times - subsequent calls return the cached module.
 * Uses a promise singleton to prevent race conditions during concurrent calls.
 *
 * @returns Promise resolving to the initialized WASM module
 * @throws Error if module fails to load
 */
export async function initWasm(): Promise<WasmModule> {
  if (wasmModule) {
    return wasmModule;
  }

  if (!initPromise) {
    initPromise = (async () => {
      const wasmMod = await import("bio-forge");
      wasmModule = wasmMod as unknown as WasmModule;
      return wasmModule;
    })();
  }

  return initPromise;
}

/**
 * Check if WASM module is ready for use.
 */
export function isWasmReady(): boolean {
  return wasmModule !== null;
}

/**
 * Get the WASM module instance.
 *
 * @returns The WASM module or null if not initialized
 */
export function getWasm(): WasmModule | null {
  return wasmModule;
}

/**
 * Get the WASM module, throwing if not initialized.
 *
 * @returns The WASM module
 * @throws Error if module is not initialized
 */
export function requireWasm(): WasmModule {
  if (!wasmModule) {
    throw new Error("WASM module not initialized. Call initWasm() first.");
  }
  return wasmModule;
}

export type { WasmModule, WasmStructure, WasmTopology, WasmTemplate };
