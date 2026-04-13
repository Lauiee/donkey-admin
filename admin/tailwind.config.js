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
          coral: "#FF5A5F",
          violet: "#7B61FF",
        },
      },
      boxShadow: {
        "admin-card":
          "0 10px 40px -4px rgba(10, 36, 101, 0.1), 0 4px 14px rgba(10, 36, 101, 0.05)",
        "admin-soft":
          "0 8px 30px rgba(10, 36, 101, 0.06), 0 2px 8px rgba(10, 36, 101, 0.04)",
        "admin-sidebar":
          "4px 0 32px rgba(10, 36, 101, 0.06)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        "4xl": "1.75rem",
      },
    },
  },
  plugins: [],
};
