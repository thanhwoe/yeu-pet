import { useColorScheme as useNativewindColorScheme } from "nativewind";

export type ColorScheme = "light" | "dark";
export type ColorSchemePreference = ColorScheme | "system";

const resolveColorScheme = (
  colorScheme: ColorScheme | "system" | undefined | null,
): ColorScheme => (colorScheme === "dark" ? "dark" : "light");

export function useColorScheme() {
  const { colorScheme, setColorScheme } = useNativewindColorScheme();
  const resolvedColorScheme = resolveColorScheme(colorScheme);

  function toggleColorScheme() {
    return setColorScheme(resolvedColorScheme === "light" ? "dark" : "light");
  }

  return {
    colorScheme: resolvedColorScheme,
    isDarkColorScheme: resolvedColorScheme === "dark",
    setColorScheme,
    toggleColorScheme,
  };
}
