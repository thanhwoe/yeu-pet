import { colorPalette, colors } from "./theme/colors";
const { hairlineWidth } = require("nativewind/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    colors,
    extend: {
      borderWidth: {
        hairline: hairlineWidth(),
      },
    },
  },
  plugins: [
    ({ addBase }) =>
      addBase({
        ":root": colorPalette,
      }),
  ],
};
