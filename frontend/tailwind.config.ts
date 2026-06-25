import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        sidebar: "var(--sidebar)",
        "sidebar-hover": "var(--sidebar-hover)",
        brand: "var(--brand)",
        "brand-light": "var(--brand-light)",
        "brand-muted": "var(--brand-muted)",
        card: "var(--card)",
        border: "var(--border)",
        muted: "var(--muted)",
        "active-transcript": "var(--active-transcript)",
      },
    },
  },
  plugins: [],
};
export default config;
