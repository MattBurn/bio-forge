/**
 * @file Polymer badge
 *
 * Badge component for displaying polymer types with icons.
 */

import { Badge, type BadgeVariant } from "@/ui/primitives";
import { ProteinIcon, NucleicIcon, SolventIcon, HeteroIcon } from "@/ui/icons";
import type { PolymerType } from "@/core";

// ============================================================================
// Types
// ============================================================================

export interface PolymerBadgeProps {
  type: PolymerType;
  /** Show icon only (no text) */
  iconOnly?: boolean;
  className?: string;
}

// ============================================================================
// Icons Map
// ============================================================================

const polymerIcons: Record<PolymerType, React.ReactNode> = {
  protein: <ProteinIcon className="size-3" />,
  nucleic: <NucleicIcon className="size-3" />,
  solvent: <SolventIcon className="size-3" />,
  hetero: <HeteroIcon className="size-3" />,
};

const polymerLabels: Record<PolymerType, string> = {
  protein: "Protein",
  nucleic: "Nucleic",
  solvent: "Solvent",
  hetero: "Hetero",
};

// ============================================================================
// Component
// ============================================================================

export function PolymerBadge({
  type,
  iconOnly = false,
  className,
}: PolymerBadgeProps) {
  return (
    <Badge
      variant={type as BadgeVariant}
      icon={polymerIcons[type]}
      className={className}
    >
      {!iconOnly && polymerLabels[type]}
    </Badge>
  );
}
