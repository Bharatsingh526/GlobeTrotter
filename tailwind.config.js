/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0F3D3E",      // Deep Teal
          secondary: "#E89B3D",    // Warm Amber
          background: "#F6F1E8",   // Warm Ivory
          surface: "#FFFDF8",      // Warm White
          dark: "#172323",         // Charcoal
          accent: "#D96C4F",       // Terracotta
          success: "#4F8068",      // Sage Green
          text: "#243333",         // Deep Slate
          muted: "#7D8581",        // Cool Grey
          border: "#E2DCD0"        // Ivory-Teal border
        }
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Fraunces", "Playfair Display", "serif"],
        sans: ["var(--font-sans)", "Inter", "Manrope", "sans-serif"],
      },
      boxShadow: {
        premium: "0 4px 20px -2px rgba(15, 61, 62, 0.05), 0 2px 6px -1px rgba(15, 61, 62, 0.03)",
        "premium-hover": "0 10px 30px -4px rgba(15, 61, 62, 0.1), 0 4px 12px -2px rgba(15, 61, 62, 0.06)",
        depth: "0 20px 40px -10px rgba(23, 35, 35, 0.15)",
        inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)"
      },
      animation: {
        "spin-slow": "spin 20s linear infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        }
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
