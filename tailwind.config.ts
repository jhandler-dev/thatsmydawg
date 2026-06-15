import type { Config } from "tailwindcss";

/*
 * DESIGN.md §2 color tokens, mapped to the CSS variables defined in
 * src/app/globals.css (the single source of truth). Wrapping each variable
 * in rgb(... / <alpha-value>) lets utilities take Tailwind opacity modifiers,
 * e.g. bg-charcoal, text-cream/55, border-gold/28. Dark theme only.
 *
 * `extend` keeps Tailwind's defaults available; our tokens override `black`,
 * `white`, and `red` with the DESIGN §2 values.
 */
const token = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: token("--color-black"),
        offblack: token("--color-offblack"),
        charcoal: token("--color-charcoal"),
        cream: token("--color-cream"),
        bone: token("--color-bone"),
        gold: token("--color-gold"),
        gold2: token("--color-gold2"),
        white: token("--color-white"),
        red: token("--color-red"),
      },
    },
  },
  plugins: [],
};

export default config;
