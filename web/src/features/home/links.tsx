/**
 * @file Links section
 *
 * Quick links to GitHub, docs, and releases.
 */

"use client";

import { motion } from "framer-motion";
import { GithubIcon, BookIcon, DownloadIcon } from "@/ui/icons";
import { GITHUB_URL, RUST_DOCS_URL, RELEASES_URL } from "@/lib";

// ============================================================================
// Data
// ============================================================================

const links = [
  {
    icon: GithubIcon,
    title: "GitHub",
    description: "Source code and issues",
    href: GITHUB_URL,
  },
  {
    icon: BookIcon,
    title: "Documentation",
    description: "API reference and guides",
    href: RUST_DOCS_URL,
  },
  {
    icon: DownloadIcon,
    title: "Releases",
    description: "Download for Windows, macOS, Linux",
    href: RELEASES_URL,
  },
];

// ============================================================================
// Component
// ============================================================================

export function Links() {
  return (
    <section className="py-24 px-6 bg-card/50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Get Started</h2>
          <p className="text-muted-foreground">
            Available as a CLI, Rust library, and WebAssembly module.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-4">
          {links.map((link, i) => (
            <motion.a
              key={link.title}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all hover:shadow-lg"
            >
              <link.icon className="size-8 text-muted-foreground group-hover:text-primary transition-colors mb-4" />
              <h3 className="font-semibold mb-1">{link.title}</h3>
              <p className="text-sm text-muted-foreground">
                {link.description}
              </p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
