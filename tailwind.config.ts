import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Display / headings → Barlow Condensed (similar to FWC2026 UltraCondensed)
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        // Body → Barlow (clean, modern, readable)
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        // Mono → unchanged
        mono: ["ui-monospace", "monospace"],
      },
      colors: {
        sca: {
          dark:    "#0a0e17",
          surface: "#12182a",
          accent:  "#00d4aa",
          gold:    "#f5b942",
          danger:  "#ff4757",
          muted:   "#64748b",
        },
      },
    },
  },
  plugins: [],
};

export default config;
