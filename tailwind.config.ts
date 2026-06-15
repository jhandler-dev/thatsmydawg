import type { Config } from "tailwindcss";

// Minimal scaffold config. Full DESIGN.md token mapping lands in W15.
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
