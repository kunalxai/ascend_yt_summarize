/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "surface": "#f7f9fb",
        "surface-container-low": "#f0f4f7",
        "surface-container": "#eaeff2",
        "surface-container-high": "#e3e9ed",
        "surface-container-highest": "#dce4e8",
        "surface-container-lowest": "#ffffff",
        "on-surface": "#2c3437",
        "on-surface-variant": "#596064",
        "primary": "#426656",
        "primary-container": "#c3ecd7",
        "primary-fixed": "#c3ecd7",
        "on-primary-container": "#345949",
        "secondary-container": "#dbe2fa",
        "on-secondary-container": "#4a5165",
        "tertiary-container": "#fef0f1",
        "on-tertiary-container": "#63595b",
        "outline": "#747c80",
        "outline-variant": "#acb3b7",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "3rem",
        full: "9999px",
      },
      boxShadow: {
        ambient: "0 12px 40px rgba(44,52,55,0.04)",
        "ambient-md": "0 12px 40px rgba(44,52,55,0.08)",
      },
    },
  },
  plugins: [],
}