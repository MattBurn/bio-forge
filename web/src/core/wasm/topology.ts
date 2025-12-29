/**
 * @file Topology operations
 *
 * Functions for exporting molecular topologies with bond information.
 */

import type { WasmTopology, TopologyConfig } from "./types";
import type { StructureFormat } from "./structure";

/**
 * Export topology to bytes in the specified format.
 *
 * @param topology - WASM topology instance
 * @param format - Output format
 * @returns Serialized topology bytes
 */
export function exportTopology(
  topology: WasmTopology,
  format: StructureFormat
): Uint8Array {
  return format === "pdb" ? topology.toPdbBytes() : topology.toMmcifBytes();
}

/**
 * Get bond count from topology.
 *
 * @param topology - WASM topology instance
 * @returns Number of bonds
 */
export function getBondCount(topology: WasmTopology): number {
  return topology.bondCount;
}

export type { TopologyConfig };
