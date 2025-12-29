/**
 * @file File card
 *
 * Individual file card with expandable details.
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import {
  Card,
  Badge,
  Checkbox,
  Dropdown,
  type DropdownItem,
} from "@/ui/primitives";
import { PolymerBadge } from "@/ui/patterns";
import {
  FileTextIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  TrashIcon,
  DownloadIcon,
  BoxIcon,
  LayersIcon,
  LinkIcon,
  AtomIcon,
} from "@/ui/icons";
import { cn, MAX_VISIBLE_CHAINS, formatFileSize } from "@/lib";
import { useFileStore, useUIStore, showSuccess, showError } from "@/state";
import type { FileEntry, ChainInfo, PolymerType } from "@/core";
import { MolViewer } from "../viewer/mol-viewer";

// ============================================================================
// Types
// ============================================================================

interface FileCardProps {
  file: FileEntry;
}

// ============================================================================
// Component
// ============================================================================

export function FileCard({ file }: FileCardProps) {
  const { toggleSelection, removeFile, selectedIds } = useFileStore(
    useShallow((s) => ({
      toggleSelection: s.toggleFileSelection,
      removeFile: s.removeFile,
      selectedIds: s.selectedIds,
    }))
  );

  const { toggleExpanded, expandedFileIds } = useUIStore(
    useShallow((s) => ({
      toggleExpanded: s.toggleFileExpanded,
      expandedFileIds: s.expandedFileIds,
    }))
  );
  const isExpanded = expandedFileIds.has(file.id);

  const [showAllChains, setShowAllChains] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const isSelected = selectedIds.has(file.id);

  const viewerData = useMemo(() => {
    if (file.status === "completed") {
      return {
        data: file.structure.toMmcifBytes(),
        format: "mmcif" as const,
      };
    }
    return {
      data: file.rawBytes,
      format: file.format,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version triggers re-render on structure mutation
  }, [file.status, file.structure, file.rawBytes, file.format, file.version]);

  const handleDownload = useCallback(
    async (targetFormat: "pdb" | "mmcif") => {
      const ext = targetFormat === "pdb" ? ".pdb" : ".cif";
      const filename = file.name.replace(/\.[^.]+$/, "") + "_forged" + ext;

      try {
        setIsConverting(true);
        const bytes =
          targetFormat === "pdb"
            ? file.structure.toPdbBytes()
            : file.structure.toMmcifBytes();

        const buffer = new Uint8Array(bytes);
        const blob = new Blob([buffer], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        showSuccess(`Downloaded ${filename}`);
      } catch (err) {
        showError(
          `Failed to convert to ${targetFormat.toUpperCase()}: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      } finally {
        setIsConverting(false);
      }
    },
    [file.name, file.structure]
  );

  const allChains = file.info?.chains ?? [];
  const visibleChains = showAllChains
    ? allChains
    : allChains.slice(0, MAX_VISIBLE_CHAINS);
  const hasMoreChains = allChains.length > MAX_VISIBLE_CHAINS;

  const polymerTypes =
    file.info?.chains
      .flatMap((c) => c.polymerTypes)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 2) ?? [];

  const downloadItems: DropdownItem[] = [
    { label: "Download as PDB", value: "pdb" },
    { label: "Download as mmCIF", value: "mmcif" },
  ];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card
        className={cn("transition-shadow", isSelected && "ring-2 ring-primary")}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-3 cursor-pointer hover:bg-card-hover transition-colors rounded-lg"
          onClick={() => toggleExpanded(file.id)}
        >
          {/* Selection checkbox */}
          <Checkbox
            checked={isSelected}
            onChange={() => toggleSelection(file.id)}
            onClick={(e) => e.stopPropagation()}
          />

          {/* File info - responsive layout */}
          <div className="flex-1 min-w-0">
            {/* Filename row */}
            <div className="flex items-center gap-2 mb-1">
              <FileTextIcon className="size-4 text-muted-foreground shrink-0" />
              <span className="font-medium truncate text-sm sm:text-base">
                {file.name}
              </span>
            </div>

            {/* Meta info - hidden on narrow screens when collapsed */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span className="shrink-0">{formatFileSize(file.size)}</span>
              {file.info && (
                <>
                  <span className="hidden xs:inline">•</span>
                  <span className="hidden xs:inline">
                    {file.info.chainCount} chains
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">
                    {file.info.atomCount.toLocaleString()} atoms
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Tags - responsive */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Status badge - always show */}
            <StatusBadge status={file.status} />

            {/* Polymer badges - hide on narrow screens */}
            <div className="hidden sm:flex items-center gap-1.5">
              {polymerTypes.map((type) => (
                <PolymerBadge key={type} type={type as PolymerType} />
              ))}
            </div>
          </div>

          {/* Expand indicator */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0"
          >
            <ChevronDownIcon className="size-4 sm:size-5 text-muted-foreground" />
          </motion.div>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-border">
                {/* Mol viewer */}
                <div className="p-4 bg-muted/30">
                  <MolViewer
                    data={viewerData.data}
                    format={viewerData.format}
                  />
                </div>

                {/* Structure details */}
                {file.info && (
                  <div className="p-4 space-y-4">
                    {/* Stats grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <StatBlock
                        icon={<LinkIcon className="size-4" />}
                        label="Chains"
                        value={file.info.chainCount}
                      />
                      <StatBlock
                        icon={<LayersIcon className="size-4" />}
                        label="Residues"
                        value={file.info.residueCount.toLocaleString()}
                      />
                      <StatBlock
                        icon={<AtomIcon className="size-4" />}
                        label="Atoms"
                        value={file.info.atomCount.toLocaleString()}
                      />
                      {file.info.boxLengths && (
                        <StatBlock
                          icon={<BoxIcon className="size-4" />}
                          label="Box"
                          value={`${file.info.boxLengths.map((v) => v.toFixed(1)).join(" × ")} Å`}
                        />
                      )}
                    </div>

                    {/* Chain list */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Chains
                      </h4>
                      <div className="grid gap-2">
                        {visibleChains.map((chain) => (
                          <ChainRow key={chain.id} chain={chain} />
                        ))}
                      </div>

                      {/* Show more/less */}
                      {hasMoreChains && (
                        <button
                          type="button"
                          onClick={() => setShowAllChains(!showAllChains)}
                          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors mt-2"
                        >
                          <ChevronRightIcon
                            className={cn(
                              "size-4 transition-transform",
                              showAllChains && "rotate-90"
                            )}
                          />
                          {showAllChains
                            ? "Show less"
                            : `Show ${allChains.length - MAX_VISIBLE_CHAINS} more chains`}
                        </button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-error hover:bg-error/10 transition-colors"
                      >
                        <TrashIcon className="size-4" />
                        Remove
                      </button>

                      {file.status === "completed" && (
                        <Dropdown
                          trigger={
                            <button
                              type="button"
                              disabled={isConverting}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm bg-muted hover:bg-muted-foreground/10 transition-colors disabled:opacity-50"
                            >
                              <DownloadIcon className="size-4" />
                              Download
                            </button>
                          }
                          items={downloadItems}
                          onSelect={(value) =>
                            handleDownload(value as "pdb" | "mmcif")
                          }
                          align="end"
                          side="top"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Error message */}
                {file.error && (
                  <div className="p-4 bg-error/5 text-error text-sm">
                    {file.error}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// Status Badge
// ============================================================================

function StatusBadge({ status }: { status: FileEntry["status"] }) {
  const variants: Record<
    FileEntry["status"],
    "default" | "success" | "warning" | "error" | "info"
  > = {
    pending: "default",
    ready: "info",
    processing: "warning",
    completed: "success",
    error: "error",
  };

  const labels: Record<FileEntry["status"], string> = {
    pending: "Pending",
    ready: "Ready",
    processing: "Processing",
    completed: "Completed",
    error: "Error",
  };

  const shortLabels: Record<FileEntry["status"], string> = {
    pending: "•",
    ready: "✓",
    processing: "…",
    completed: "✓",
    error: "!",
  };

  return (
    <Badge
      variant={variants[status]}
      className={cn(
        "text-[10px] sm:text-xs px-1.5 sm:px-2",
        status === "processing" && "animate-pulse"
      )}
    >
      <span className="hidden xs:inline">{labels[status]}</span>
      <span className="xs:hidden">{shortLabels[status]}</span>
    </Badge>
  );
}

// ============================================================================
// Stat Block
// ============================================================================

interface StatBlockProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

function StatBlock({ icon, label, value }: StatBlockProps) {
  return (
    <div className="p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

// ============================================================================
// Chain Row
// ============================================================================

function ChainRow({ chain }: { chain: ChainInfo }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
      <span className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
        {chain.id}
      </span>
      <div className="flex-1 text-sm">
        {chain.residueCount} residues • {chain.atomCount.toLocaleString()} atoms
      </div>
      <div className="flex gap-1">
        {chain.polymerTypes.map((type) => (
          <PolymerBadge key={type} type={type as PolymerType} />
        ))}
        {chain.polymerTypes.length === 0 && (
          <span className="text-xs text-muted-foreground">Empty</span>
        )}
      </div>
    </div>
  );
}
