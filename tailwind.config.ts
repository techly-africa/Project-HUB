import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary:   "var(--color-bg-primary)",
          secondary: "var(--color-bg-secondary)",
        },
        surface: {
          DEFAULT:  "var(--color-surface)",
          elevated: "var(--color-surface-elevated)",
          hover:    "var(--color-surface-hover)",
        },
        border: {
          subtle: "var(--color-border-subtle)",
          medium: "var(--color-border-medium)",
        },
        accent: {
          primary:   "var(--color-accent-primary)",
          secondary: "var(--color-accent-secondary)",
          warning:   "var(--color-accent-warning)",
          success:   "var(--color-accent-success)",
          danger:    "var(--color-accent-danger)",
        },
        brand: {
          teal:  "#14b8a6",
          pink:  "#db2777",
          navy:  "#020617",
          slate: "#0f172a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      textColor: {
        primary:   "var(--color-text-primary)",
        secondary: "var(--color-text-secondary)",
        muted:     "var(--color-text-muted)",
        contrast:  "var(--color-text-contrast)", // white in dark, slate-900 in light
      },
      boxShadow: {
        premium: "0 0 0 1px var(--color-border-subtle), 0 8px 24px -8px rgba(0,0,0,0.35)",
      },
      animation: {
        shimmer: "shimmer 2s infinite linear",
      },
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
