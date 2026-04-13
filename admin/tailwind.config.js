/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#000000",
          navy: "#0A2465",
          slate: "#5B6B95",
          mint: "#7B8DB8",
          accent: "#40E0D0",
          accentDark: "#35b8aa",
          canvas: "#F4F7FA",
          surface: "#FAFAFA",
          line: "#E2E8F0",
        },
      },
      boxShadow: {
        "admin-card":
          "0 4px 24px rgba(10, 36, 101, 0.06), 0 1px 3px rgba(10, 36, 101, 0.04)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
