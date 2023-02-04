/** @type {import('tailwindcss').Config} */

const colors = {
  "blue-chill": {
    50: "#ecfdff",
    100: "#d0f7fd",
    200: "#a7edfa",
    300: "#6bdef5",
    400: "#27c6e9",
    500: "#0ba8cf",
    600: "#0d8db6",
    700: "#116c8d",
    800: "#175973",
    900: "#184961",
  },
};

module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        primary: colors["blue-chill"],
      },
    },
  },
  plugins: [],
};
