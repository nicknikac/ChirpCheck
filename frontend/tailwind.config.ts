import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#f5f2eb",
          50: "#faf8f4",
          100: "#f5f2eb",
          200: "#e8e4dc",
          300: "#d6d0c4",
          400: "#b8b2a6",
        },
        midnight: {
          DEFAULT: "#0a0a0a",
          50: "#171717",
          100: "#262626",
          200: "#404040",
        },
        forest: {
          DEFAULT: "#2d6a4f",
          light: "#40916c",
          dark: "#1b4332",
        },
        warm: {
          50: "#faf8f4",
          100: "#f5f2eb",
          200: "#e8e4dc",
          300: "#d6d0c4",
          400: "#b8b2a6",
          500: "#908a7e",
          600: "#6b665c",
          700: "#4a463e",
          800: "#2e2b26",
          900: "#1c1917",
          950: "#0a0a0a",
        },
      },
      fontFamily: {
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      gridTemplateColumns: {
        hero: "1.2fr 1fr",
      },
    },
  },
  plugins: [],
};

export default config;
