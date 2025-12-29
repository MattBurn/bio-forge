/**
 * @file Footer section
 *
 * Site footer with copyright and links.
 */

import { GithubIcon } from "@/ui/icons";
import { GITHUB_URL } from "@/lib";

// ============================================================================
// Component
// ============================================================================

export function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} BioForge. MIT License.
        </p>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <GithubIcon className="size-5" />
        </a>
      </div>
    </footer>
  );
}
