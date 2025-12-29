/**
 * @file Root Layout
 *
 * Next.js root layout with global providers.
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// ============================================================================
// Font
// ============================================================================

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = {
  title: "BioForge - Biological Structure Preparation Toolkit",
  description:
    "A pure Rust library, CLI, and Web-App for the automated repair, preparation, and topology construction of biological macromolecules.",
  keywords: [
    "molecular dynamics",
    "structure preparation",
    "bioinformatics",
    "pdb",
    "mmcif",
    "webassembly",
    "cli",
    "web app",
    "rust",
    "high-performance computing",
  ],
  icons: {
    icon: "/favicon.svg",
  },
};

// ============================================================================
// Layout
// ============================================================================

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
