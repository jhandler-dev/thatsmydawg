import type { Metadata, Viewport } from "next";
import { Bebas_Neue, DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

/*
 * DESIGN.md §3 typography — the three (and only three) families, loaded via
 * next/font/google so they self-host, get `font-display: swap`, and ship a
 * size-adjust fallback (no layout shift, no external request at runtime).
 * Each exposes a CSS variable consumed by Tailwind's fontFamily tokens
 * (see tailwind.config.ts) and the base layer in globals.css.
 *
 * Weights are scoped to what DESIGN §3 actually uses — nothing extra:
 *   Bebas Neue       — display: hero title, scene names, step numbers, logo (single weight 400)
 *   DM Sans          — body/UI workhorse (300/400/500/600)
 *   Playfair Display — editorial serif accent, used sparingly (700/900, incl. italic)
 */
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-bebas",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-dm-sans",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "That's My Dawg",
  description:
    "Upload your dog, drop it into a hand-designed scene, order the printed tee.",
};

// DESIGN.md §2 — dark theme only; matches --color-black so mobile browser
// chrome (address bar, etc.) never flashes a light color on load.
export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${dmSans.variable} ${playfairDisplay.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
