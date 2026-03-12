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
          DEFAULT: "#2D2D2D",
          dark: "#1A1A1A",
          light: "#404040",
        },
        brand: {
          pink: "#F7A800",
          teal: "#2bb4ca",
          blue: "#1d70b8",
          navy: "#2D2D2D",
          orange: "#F7A800",
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
