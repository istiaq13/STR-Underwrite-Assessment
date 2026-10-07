/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#09090b",
        muted: {
          DEFAULT: "#f4f4f5",
          foreground: "#71717a",
        },
        border: "#e4e4e7",
        primary: {
          DEFAULT: "#09090b",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#2563eb",
          foreground: "#ffffff",
        },
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)",
        card: "0 0 0 1px rgba(228, 228, 231, 0.8), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        "card-hover": "0 0 0 1px rgba(212, 212, 216, 1), 0 4px 12px 0 rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};
