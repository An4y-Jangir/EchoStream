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
        background: "var(--background)",
        foreground: "var(--foreground)",
        "primary": "#121212",
        "accent": "#6366f1",
        "background-light": "#f7f7f7",
        "background-dark": "#0a0a0a",
      },
      fontFamily: {
        "sans": ["'Munich Sans'", "sans-serif"],
        "display": ["'Munich Sans'", "sans-serif"],
        "space-grotesk": ["'Space Grotesk'", "sans-serif"],
        "righteous": ["Righteous", "sans-serif"],
        "stomic": ["Stomic", "'Hobeaux Semibold'", "Hobeaux", "sans-serif"],
        "hobeaux": ["'Hobeaux Semibold'", "Hobeaux", "sans-serif"]
      },
    },
  },
  plugins: [],
};
export default config;
