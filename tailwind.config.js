/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/components/**/*.{ts,tsx,js,jsx}",
    "./src/app/**/*.{ts,tsx,js,jsx}",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        serif: ["var(--font-fraunces)", "Fraunces", "serif"],
      },
      colors: {
        // Brand — deep teal. Primary actions, active nav, links, focus borders.
        brand: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          400: "#2dd4bf",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },
        // Ink — graphite/near-black scale, used for the "dark" button variant
        // and any high-emphasis neutral surface.
        ink: {
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        },
        // Neutral — extra step not in default Tailwind scale, used for
        // unfilled stock-tier segments.
        neutral: {
          200: "#e5e5e5",
        },
        // Status — semantic names instead of raw palette colors
        success: {
          50: "#ecfdf5",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        warning: {
          50: "#fffbeb",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        danger: {
          50: "#fff1f2",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
        },
      },
      borderRadius: {
        sm: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
      },
      boxShadow: {
        // Glass-edge shadows used on gradient buttons — inset highlight
        // (top edge) + colored drop shadow matched to each variant.
        "glass-brand": "inset 0 1px 0 0 rgba(255,255,255,0.16), 0 8px 20px -6px rgba(11,79,72,0.55)",
        "glass-dark": "inset 0 1px 0 0 rgba(255,255,255,0.12), 0 8px 20px -6px rgba(0,0,0,0.55)",
        "glass-danger": "inset 0 1px 0 0 rgba(255,255,255,0.16), 0 8px 20px -6px rgba(159,18,57,0.5)",
      },
    },
  },
  plugins: [],
};