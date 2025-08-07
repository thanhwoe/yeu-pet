import { vars } from "nativewind";
import { lightColorTheme } from "./colors";
import { getColors } from "./utils";
export * from "./colors";

export const themes = {
  light: vars(getColors(lightColorTheme)),
  dark: vars(
    getColors({
      "--background-default": "#151515",

      "--text-link": "#D2C7FF",
      "--text-primary": "#FFFFFF",
      "--text-warning": "#FFD000",
      "--text-positive": "#36D76F",
      "--text-negative": "#E50000",
    })
  ),
};
