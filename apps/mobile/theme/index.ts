import { vars } from "nativewind";
import { darkColorTheme, lightColorTheme } from "./colors";
import { getColors } from "./utils";
export * from "./colors";
export * from "./fonts";

export const themes = {
  light: vars(getColors(lightColorTheme)),
  dark: vars(getColors(darkColorTheme)),
};
