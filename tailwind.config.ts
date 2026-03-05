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
        display: ["system-ui", "sans-serif"],
        mono: ["ui-monospace", "monospace"],
      },
      colors: {
        sca: {
          dark: "#0a0e17",
          surface: "#12182a",
          accent: "#00d4aa",
          gold: "#f5b942",
          danger: "#ff4757",
          muted: "#64748b",
        },
      },
    },
  },
  plugins: [],
};
export default config;
