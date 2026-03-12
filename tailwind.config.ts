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
        navy: {
          DEFAULT: "#1A3A5C",
          dark: "#0E2035",
          light: "#2C4F73",
        },
        brand: {
          pink: "#e21b7a",
          teal: "#2bb4ca",
          blue: "#1d70b8",
          navy: "#1A3A5C",
        },
        gold: {
          DEFAULT: "#F7A800",
          light: "#FDD060",
          dark: "#C78600",
        },
        steel: "#4A7FA5",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
