import borderRadius from "./theme/borderRadius";
import { colorPalette, colors } from "./theme/colors";
import { fontFamily, fontSize } from "./theme/fonts";
import boxShadow from "./theme/shadows";
import spacing from "./theme/spacing";

const { hairlineWidth } = require("nativewind/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./hocs/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    colors,
    fontFamily,
    fontSize,
    spacing,
    borderRadius,
    boxShadow,
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
