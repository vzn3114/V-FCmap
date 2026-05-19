/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        emerald: {
          50:  "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        fc: {
          bg:    "#f8fafc",
          panel: "rgba(255,255,255,0.9)",
          line:  "#e5e7eb",
          text:  "#1f2937",
          muted: "#6b7280",
          green: "#10b981",
        }
      },
      fontFamily: {
        sora:    ["Sora", "Inter", "sans-serif"],
        grotesk: ["Space Grotesk", "Inter", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        soft: "0 4px 12px rgba(0,0,0,0.08)",
        card: "0 10px 24px rgba(0,0,0,0.08)",
        green: "0 4px 14px rgba(16,185,129,0.35)",
      }
    }
  },
  plugins: []
};
