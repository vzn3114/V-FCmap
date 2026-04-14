/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        fc: {
          bg: "#05070f",
          panel: "rgba(13,20,38,0.64)",
          line: "rgba(153,188,255,0.24)",
          text: "#e6f1ff",
          muted: "#9fb2d1",
          neon: "#22d3ee",
          green: "#34d399"
        }
      },
      boxShadow: {
        soft: "0 12px 40px rgba(3, 8, 20, 0.45)",
        neon: "0 0 25px rgba(34, 211, 238, 0.35)"
      },
      backdropBlur: {
        xs: "2px"
      }
    }
  },
  plugins: []
};
