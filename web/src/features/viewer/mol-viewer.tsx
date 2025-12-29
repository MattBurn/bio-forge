/**
 * @file Mol viewer
 *
 * 3D molecular structure viewer using Mol*.
 */

"use client";

import { useRef, useEffect, useState, useCallback, memo } from "react";
import { cn } from "@/lib";
import type { StructureFormat } from "@/core";
import {
  LoaderIcon,
  AlertCircleIcon,
  RefreshIcon,
  MaximizeIcon,
  MinimizeIcon,
} from "@/ui/icons";

// ============================================================================
// Types
// ============================================================================

interface MolViewerProps {
  /** Structure data as binary bytes */
  data: Uint8Array;
  /** Structure format */
  format: StructureFormat;
  /** Additional class names */
  className?: string;
}

// Mol* plugin type - external library with complex types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MolstarPlugin = any;

// ============================================================================
// Instance Registry
// ============================================================================

/**
 * Module-level registry to track Mol* instances by container element.
 * Uses WeakMap for automatic garbage collection and React StrictMode compatibility.
 */
const molstarInstances = new WeakMap<HTMLElement, MolstarPlugin>();

// ============================================================================
// Component
// ============================================================================

export const MolViewer = memo(function MolViewer({
  data,
  format,
  className,
}: MolViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef(data);
  const formatRef = useRef(format);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load structure data into viewer
  const loadStructure = useCallback(
    async (plugin: MolstarPlugin, bytes: Uint8Array, fmt: StructureFormat) => {
      setIsLoading(true);
      setError(null);

      try {
        await plugin.clear();

        const data = new TextDecoder().decode(bytes);

        const rawData = await plugin.builders.data.rawData({ data });
        const trajectory = await plugin.builders.structure.parseTrajectory(
          rawData,
          fmt
        );
        await plugin.builders.structure.hierarchy.applyPreset(
          trajectory,
          "default"
        );
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load structure:", err);
        setError("Failed to parse structure");
        setIsLoading(false);
      }
    },
    []
  );

  // Initialize or reuse viewer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    const target = container;

    async function initOrReuse() {
      const existingPlugin = molstarInstances.get(target);
      if (existingPlugin) {
        if (!cancelled) {
          await loadStructure(
            existingPlugin,
            dataRef.current,
            formatRef.current
          );
        }
        return;
      }

      try {
        const { createPluginUI } = await import("molstar/lib/mol-plugin-ui");
        const { renderReact18 } =
          await import("molstar/lib/mol-plugin-ui/react18");
        const { DefaultPluginUISpec } =
          await import("molstar/lib/mol-plugin-ui/spec");

        if (cancelled) return;
        if (molstarInstances.has(target)) {
          const plugin = molstarInstances.get(target)!;
          await loadStructure(plugin, dataRef.current, formatRef.current);
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spec: any = {
          ...DefaultPluginUISpec(),
          layout: {
            initial: {
              isExpanded: false,
              showControls: false,
              regionState: {
                left: "collapsed",
                right: "collapsed",
                top: "hidden",
                bottom: "hidden",
              },
            },
          },
          components: { remoteState: "none" },
        };

        const plugin = await createPluginUI({
          target,
          spec,
          render: renderReact18,
        });

        if (cancelled) {
          plugin.dispose();
          return;
        }

        plugin.canvas3d?.setProps({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          renderer: { backgroundColor: 0x1e1e1e as any },
        });

        molstarInstances.set(target, plugin);
        await loadStructure(plugin, dataRef.current, formatRef.current);
      } catch (err) {
        console.error("Failed to initialize Mol* viewer:", err);
        if (!cancelled) {
          setError("Failed to initialize 3D viewer");
          setIsLoading(false);
        }
      }
    }

    initOrReuse();

    return () => {
      cancelled = true;
      const plugin = molstarInstances.get(target);
      if (plugin) {
        plugin.dispose();
        molstarInstances.delete(target);
      }
    };
  }, [loadStructure]);

  // Handle data/format changes
  useEffect(() => {
    const prevData = dataRef.current;
    const prevFormat = formatRef.current;
    dataRef.current = data;
    formatRef.current = format;

    if (prevData === data && prevFormat === format) return;

    const container = containerRef.current;
    if (!container) return;

    const plugin = molstarInstances.get(container);
    if (plugin) {
      loadStructure(plugin, data, format);
    }
  }, [data, format, loadStructure]);

  // Reset camera
  const resetCamera = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    molstarInstances.get(container)?.managers.camera.reset();
  }, []);

  return (
    <div className={cn("relative", className)}>
      {/* Viewer container */}
      <div
        className={cn(
          "rounded-lg overflow-hidden transition-all duration-300",
          "bg-[#1e1e1e]",
          isExpanded ? "fixed inset-4 z-50" : "h-64"
        )}
      >
        {/* Molstar canvas mount point */}
        <div ref={containerRef} className="relative w-full h-full" />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e]">
            <div className="text-center">
              <LoaderIcon className="size-8 text-primary animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground mt-3">
                Loading 3D viewer...
              </p>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e]">
            <div className="text-center p-8">
              <AlertCircleIcon className="size-10 text-warning mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          {!isLoading && !error && (
            <button
              type="button"
              onClick={resetCamera}
              className={cn(
                "p-2 rounded-lg",
                "bg-black/60 hover:bg-black/80 transition-colors",
                "text-white/70 hover:text-white"
              )}
              title="Reset view"
            >
              <RefreshIcon className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "p-2 rounded-lg",
              "bg-black/60 hover:bg-black/80 transition-colors",
              "text-white/70 hover:text-white"
            )}
            title={isExpanded ? "Exit fullscreen" : "Fullscreen"}
          >
            {isExpanded ? (
              <MinimizeIcon className="size-4" />
            ) : (
              <MaximizeIcon className="size-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/90 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
});
