/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        card: "var(--card)",
        surface: "var(--surface)",
        primary: "var(--primary)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
      },
      borderRadius: {
        card: "20px",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(0, 0, 0, 0.28)",
      },
    },
  },
  plugins: [],
};
