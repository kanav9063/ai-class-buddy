import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0f1117",
          panel: "#1a1d27",
          border: "#2a2d3a",
          text: "#e2e4eb",
          muted: "#8b8fa3",
          accent: "#6c5ce7",
          "accent-hover": "#7c6ef7",
        },
      },
    },
  },
  plugins: [],
};
export default config;
