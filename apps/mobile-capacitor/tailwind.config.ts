import type { Config } from "tailwindcss";
import daisyui from "daisyui";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#F97E1F",
          dark: "#E06D10",
        },
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        yeupet: {
          primary: "#F97E1F",
          secondary: "#FFB347",
          accent: "#37cdbe",
          neutral: "#3d4451",
          "base-100": "#ffffff",
          "base-200": "#f5f5f5",
          "base-300": "#e5e5e5",
        },
      },
    ],
  },
} satisfies Config;
