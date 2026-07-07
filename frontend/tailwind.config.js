/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E1526",
        inkPanel: "#131B33",
        inkLine: "#262F4A",
        paper: "#EDEEE8",
        paperDim: "#DCDDD3",
        paperText: "#1B2233",
        stampRed: "#B23A2E",
        stampRedDark: "#8C2C22",
        brass: "#A9884C",
        verified: "#1F8A70",
      },
      fontFamily: {
        display: ['"Source Serif 4"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
