/**
 * @file File parser utilities
 *
 * Functions for reading and parsing uploaded files.
 */

import type { StructureFormat, WasmStructure, WasmTemplate } from "../wasm";
import { requireWasm } from "../wasm/module";
import type { FileEntry, TemplateEntry } from "./types";

// ============================================================================
// Format Detection (from file extension only)
// ============================================================================

/** Map of file extensions to structure formats */
const EXTENSION_FORMAT_MAP: Record<string, StructureFormat> = {
  ".pdb": "pdb",
  ".ent": "pdb",
  ".cif": "mmcif",
  ".mmcif": "mmcif",
};

/** File extensions for template formats */
const TEMPLATE_EXTENSIONS = [".mol2"];

/**
 * Get structure format from file extension.
 *
 * @param filename - File name to check
 * @returns Structure format or null if not a structure file
 */
export function getFormatFromExtension(
  filename: string
): StructureFormat | null {
  const lower = filename.toLowerCase();
  for (const [ext, format] of Object.entries(EXTENSION_FORMAT_MAP)) {
    if (lower.endsWith(ext)) {
      return format;
    }
  }
  return null;
}

/**
 * Check if file is a valid structure file.
 *
 * @param filename - File name to check
 * @returns True if file has a recognized structure extension
 */
export function isStructureFile(filename: string): boolean {
  return getFormatFromExtension(filename) !== null;
}

/**
 * Check if file is a valid template file.
 *
 * @param filename - File name to check
 * @returns True if file has a recognized template extension
 */
export function isTemplateFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return TEMPLATE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

// ============================================================================
// File Reading
// ============================================================================

/**
 * Read file content as binary data.
 *
 * @param file - File object to read
 * @returns Promise resolving to file bytes
 */
export function readFileAsBytes(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () =>
      reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
}

// ============================================================================
// File Entry Creation
// ============================================================================

/** Counter for generating unique IDs */
let idCounter = 0;

/**
 * Generate a unique file ID.
 */
export function generateFileId(): string {
  return `file-${Date.now()}-${++idCounter}`;
}

/**
 * Parse bytes into a WASM Structure.
 *
 * @param bytes - File bytes
 * @param format - Structure format
 * @returns Parsed WASM structure
 * @throws Error if parsing fails
 */
export function parseStructureBytes(
  bytes: Uint8Array,
  format: StructureFormat
): WasmStructure {
  const wasm = requireWasm();
  return format === "pdb"
    ? wasm.Structure.fromPdbBytes(bytes)
    : wasm.Structure.fromMmcifBytes(bytes);
}

/**
 * Parse bytes into a WASM Template.
 *
 * @param bytes - MOL2 file bytes
 * @returns Parsed WASM template
 * @throws Error if parsing fails
 */
export function parseTemplateBytes(bytes: Uint8Array): WasmTemplate {
  const wasm = requireWasm();
  return wasm.Template.fromMol2Bytes(bytes);
}

/**
 * Create a file entry from uploaded file bytes.
 *
 * Parses the structure immediately and stores the WASM object.
 *
 * @param file - File object
 * @param bytes - File bytes (pre-read)
 * @returns File entry with structure object
 * @throws Error if file format cannot be determined or parsing fails
 */
export function createFileEntry(file: File, bytes: Uint8Array): FileEntry {
  const format = getFormatFromExtension(file.name);
  if (!format) {
    throw new Error(`Unsupported file format: ${file.name}`);
  }

  const structure = parseStructureBytes(bytes, format);
  const info = structure.info();

  return {
    id: generateFileId(),
    name: file.name,
    size: file.size,
    format,
    rawBytes: bytes,
    structure,
    status: "ready",
    info,
    version: 0,
  };
}

/**
 * Create a template entry from uploaded file bytes.
 *
 * @param file - File object
 * @param bytes - MOL2 file bytes (pre-read)
 * @returns Template entry with WASM object
 */
export function createTemplateEntry(
  file: File,
  bytes: Uint8Array
): TemplateEntry {
  const template = parseTemplateBytes(bytes);

  return {
    id: `template-${Date.now()}-${++idCounter}`,
    name: template.name,
    size: file.size,
    rawBytes: bytes,
    template,
  };
}

// ============================================================================
// Batch File Processing
// ============================================================================

/**
 * Process multiple uploaded files.
 *
 * @param files - Array of File objects
 * @returns Object with parsed structures and templates
 */
export async function parseUploadedFiles(files: File[]): Promise<{
  structures: FileEntry[];
  templates: TemplateEntry[];
  errors: Array<{ name: string; error: string }>;
}> {
  const structures: FileEntry[] = [];
  const templates: TemplateEntry[] = [];
  const errors: Array<{ name: string; error: string }> = [];

  await Promise.all(
    files.map(async (file) => {
      try {
        const bytes = await readFileAsBytes(file);

        if (isStructureFile(file.name)) {
          structures.push(createFileEntry(file, bytes));
        } else if (isTemplateFile(file.name)) {
          templates.push(createTemplateEntry(file, bytes));
        } else {
          errors.push({
            name: file.name,
            error: "Unsupported file type",
          });
        }
      } catch (err) {
        errors.push({
          name: file.name,
          error: err instanceof Error ? err.message : "Failed to read file",
        });
      }
    })
  );

  return { structures, templates, errors };
}
