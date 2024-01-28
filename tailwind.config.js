/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      xs: "375px",
      ...defaultTheme.screens,
    },
    extend: {
      colors: {
        shark: {
          50: "#f6f8f9",
          100: "#eceff2",
          200: "#d4dce3",
          300: "#aebecb",
          400: "#829aae",
          500: "#637e94",
          600: "#4e667b",
          700: "#405264",
          800: "#384654",
          900: "#273039",
          950: "#1D232A",
        },
        clay: {
          DEFAULT: "#1D232A",
          50: "#395353",
          100: "#364D4E",
          200: "#304145",
          300: "#29373C",
          400: "#232C33",
          500: "#1D232A",
          600: "#1B1F27",
          700: "#191B24",
          800: "#171821",
          900: "#15151E",
          950: "#14141C",
        },
      },
    },
  },
  experimental: {
    darkModeVariant: true,
  },
  dark: "class",
  plugins: [],
};
