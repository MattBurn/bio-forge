/**
 * @file useKeyboardShortcuts hook
 *
 * Hook for managing global keyboard shortcuts.
 */

import { useEffect, useCallback } from "react";
import { useFileStore, showInfo } from "../stores";

/**
 * Hook for handling global keyboard shortcuts in the app.
 */
export function useKeyboardShortcuts() {
  const files = useFileStore((s) => s.files);
  const selectedIds = useFileStore((s) => s.selectedIds);
  const selectAllFiles = useFileStore((s) => s.selectAllFiles);
  const clearSelection = useFileStore((s) => s.clearSelection);
  const removeSelectedFiles = useFileStore((s) => s.removeSelectedFiles);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Skip if typing in input
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Cmd/Ctrl + A: Select all
      if ((event.metaKey || event.ctrlKey) && event.key === "a") {
        event.preventDefault();
        if (files.length > 0) {
          selectAllFiles();
        }
      }

      // Escape: Clear selection
      if (event.key === "Escape") {
        clearSelection();
      }

      // Delete/Backspace: Remove selected
      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedIds.size > 0
      ) {
        event.preventDefault();
        const count = selectedIds.size;
        removeSelectedFiles();
        showInfo(`Removed ${count} file${count !== 1 ? "s" : ""}`);
      }
    },
    [
      files.length,
      selectedIds.size,
      selectAllFiles,
      clearSelection,
      removeSelectedFiles,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
