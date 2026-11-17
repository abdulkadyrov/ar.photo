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
        "primary-soft": "var(--primary-soft)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
      },
      borderRadius: {
        card: "10px",
      },
      boxShadow: {
        soft: "none",
      },
    },
  },
  plugins: [],
};
