/**
 * @file Icon components
 *
 * Centralized icon exports using lucide-react with custom domain-specific icons.
 */

// ============================================================================
// Re-export from lucide-react
// ============================================================================

export {
  // File/Document
  File as FileIcon,
  FilePlus as FilePlusIcon,
  FileText as FileTextIcon,
  Folder as FolderIcon,

  // Actions
  Play as PlayIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Trash2 as TrashIcon,
  RefreshCw as RefreshIcon,
  Copy as CopyIcon,
  Settings as SettingsIcon,

  // Navigation
  ChevronDown as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  X as XIcon,
  MoreVertical as MoreVerticalIcon,
  ExternalLink as ExternalLinkIcon,
  Home as HomeIcon,
  Maximize2 as MaximizeIcon,
  Minimize2 as MinimizeIcon,

  // Status
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  AlertTriangle as AlertTriangleIcon,
  Info as InfoIcon,
  Loader2 as LoaderIcon,

  // Domain-specific
  Beaker as BeakerIcon,
  Droplet as DropletIcon,
  Zap as ZapIcon,
  Layers as LayersIcon,
  Box as BoxIcon,
  Sparkles as SparklesIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Link as LinkIcon,
  Atom as AtomIcon,
  Archive as ArchiveIcon,
  Book as BookIcon,
  Terminal as TerminalIcon,
  Wrench as WrenchIcon,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

export interface IconProps {
  className?: string;
}

// ============================================================================
// Custom Icons (not available in lucide-react)
// ============================================================================

import { cn } from "@/lib";

/** GitHub brand icon */
export function GithubIcon({ className }: IconProps) {
  return (
    <svg
      className={cn("size-4", className)}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

/** DNA double helix icon */
export function DNAIcon({ className }: IconProps) {
  return (
    <svg
      className={cn("size-4", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 15c6.667-6 13.333 0 20-6" />
      <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />
      <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" />
      <path d="m17 6-2.5-2.5" />
      <path d="m14 8-1-1" />
      <path d="m7 18 2.5 2.5" />
      <path d="m3.5 14.5.5.5" />
      <path d="m20 9 .5.5" />
      <path d="m6.5 12.5 1 1" />
      <path d="m16.5 10.5 1 1" />
      <path d="m10 16 1.5 1.5" />
    </svg>
  );
}

/** Molecule icon */
export function MoleculeIcon({ className }: IconProps) {
  return (
    <svg
      className={cn("size-4", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="2" />
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
      <line x1="12" y1="10" x2="12" y2="8" />
      <line x1="6" y1="8" x2="6" y2="10" />
      <line x1="18" y1="8" x2="18" y2="10" />
      <line x1="12" y1="14" x2="12" y2="16" />
      <line x1="10" y1="12" x2="8" y2="12" />
      <line x1="14" y1="12" x2="16" y2="12" />
    </svg>
  );
}

// ============================================================================
// Polymer Type Icons
// ============================================================================

/** Protein icon */
export function ProteinIcon({ className }: IconProps) {
  return (
    <svg
      className={cn("size-4", className)}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M28.4165 21.8466C28.2998 24.4327 28.9576 26.2456 30.3899 27.2851C32.5385 28.8445 37.8372 29.0273 42.0342 21.8466C46.2313 14.6658 42.1598 10.7653 40.6133 10.1148C39.5823 9.68111 38.546 9.51854 37.5044 9.62707" />
      <path d="M31.0138 28.0061C29.7932 29.4196 29.6591 31.1176 30.6115 33.1C32.0401 36.0735 35.6988 35.5388 37.5277 38.0157C38.747 39.6671 39.2088 41.3285 38.9132 43" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.50434 23.6397C10.7641 26.6609 16.1663 27.0551 22.5 24.6306C25.0645 23.649 27.7817 22.2052 30.5049 20.2867C32.5577 18.8404 34.0451 17.3644 35.0919 15.92C38.8633 10.716 36.9159 5.92222 35.0919 4.40635C33.1156 2.76399 29.322 2.08888 22.5 5.03345C21.2777 5.56103 19.9582 6.20481 18.5345 6.98005C15.7374 8.50312 13.4336 10.2232 11.6622 11.9999C7.4997 16.1749 6.27733 20.6622 8.50434 23.6397Z"
      />
      <path d="M16.2451 8.83911C16.6842 11.7889 17.9165 14.368 19.9419 16.5764C21.9673 18.7848 24.3883 20.195 28 21.4999" />
      <path d="M9.98149 24.9998C4.15571 30.6503 2.58552 34.9286 5.27092 37.8346C9.29902 42.1936 13.0878 36.6267 18.1666 36.6267C21.5524 36.6267 24.1636 38.751 26 42.9998" />
      <path d="M35.0919 15.9199C34.0451 17.3643 32.5577 18.8403 30.5049 20.2866C27.7817 22.2052 25.0645 23.6489 22.5 24.6306" />
      <path d="M22.4999 5.03345C21.2776 5.56103 19.9581 6.20481 18.5344 6.98004C15.7374 8.50312 13.4335 10.2232 11.6621 11.9999" />
    </svg>
  );
}

/** Nucleic acid icon (simplified DNA) */
export function NucleicIcon({ className }: IconProps) {
  return (
    <svg
      className={cn("size-4", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 15c6.667-6 13.333 0 20-6" />
      <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />
      <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" />
      <path d="m17 6-2.5-2.5" />
      <path d="m14 8-1-1" />
      <path d="m7 18 2.5 2.5" />
      <path d="m3.5 14.5.5.5" />
      <path d="m20 9 .5.5" />
    </svg>
  );
}

/** Solvent/water icon (same as DropletIcon but kept for semantic clarity) */
export function SolventIcon({ className }: IconProps) {
  return (
    <svg
      className={cn("size-4", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
    </svg>
  );
}

/** Hetero residue/ligand icon */
export function HeteroIcon({ className }: IconProps) {
  return (
    <svg
      className={cn("size-4", className)}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 12C10.2091 12 12 10.2091 12 8C12 5.79086 10.2091 4 8 4C5.79086 4 4 5.79086 4 8C4 10.2091 5.79086 12 8 12Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 42C13.3137 42 16 39.3137 16 36C16 32.6863 13.3137 30 10 30C6.68629 30 4 32.6863 4 36C4 39.3137 6.68629 42 10 42Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M38 44C41.3137 44 44 41.3137 44 38C44 34.6863 41.3137 32 38 32C34.6863 32 32 34.6863 32 38C32 41.3137 34.6863 44 38 44Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22 28C26.4183 28 30 24.4183 30 20C30 15.5817 26.4183 12 22 12C17.5817 12 14 15.5817 14 20C14 24.4183 17.5817 28 22 28Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M34 12C36.2091 12 38 10.2091 38 8C38 5.79086 36.2091 4 34 4C31.7909 4 30 5.79086 30 8C30 10.2091 31.7909 12 34 12Z"
      />
      <path d="M11 11L15 15" />
      <path d="M30 12L28 14" />
      <path d="M34 33.5L28 26" />
      <path d="M14 31L18 27" />
    </svg>
  );
}
