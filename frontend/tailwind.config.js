/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0a0a0a",
        secondary: "#d4af37",
        "text-color": "#f5f5f5",
        "text-muted": "#a0a0a0",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
      },
    },
  },
  plugins: [],
};
