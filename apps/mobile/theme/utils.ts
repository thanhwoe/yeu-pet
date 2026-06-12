import { colorPalette } from "./colors";

type ThemeObject = Record<string, string>;

interface NestedConfig {
  DEFAULT?: string;
  [key: string]: string | NestedConfig | undefined;
}

interface GeneratedConfig {
  [key: string]: NestedConfig;
}

export function generateThemeKeys(input: ThemeObject): GeneratedConfig {
  const result: GeneratedConfig = {};

  // Helper function to set nested value
  function setNestedValue(obj: GeneratedConfig, path: string): void {
    const keys = path.slice(2).split("-"); // Remove '--' prefix and split
    let current: any = obj;

    // Navigate/create the nested structure
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      if (i === keys.length - 1) {
        // Last key - set the DEFAULT value
        if (!current[key]) {
          current[key] = {};
        }
        current[key].DEFAULT = `var(${path})`;
      } else {
        // Intermediate key - create nested object if doesn't exist
        if (!current[key]) {
          current[key] = {};
        }
        current = current[key];
      }
    }
  }

  // Process each CSS custom property
  Object.keys(input).forEach((key) => {
    if (key.startsWith("--")) {
      setNestedValue(result, key);
    }
  });

  return result;
}

export function getColors(data: ThemeObject): ThemeObject {
  const result: ThemeObject = {};

  const resolveColor = (value: string, seen = new Set<string>()): string => {
    if (colorPalette[value as keyof typeof colorPalette]) {
      return colorPalette[value as keyof typeof colorPalette];
    }

    if (data[value] && !seen.has(value)) {
      seen.add(value);
      return resolveColor(data[value], seen);
    }

    return value;
  };

  for (const key in data) {
    result[key] = resolveColor(data[key]);
  }

  return result;
}

export function generateColorKeys(colorPalette: any) {
  const result: Record<string, any> = {};

  Object.keys(colorPalette).forEach((key) => {
    // Remove the "--" prefix and split by "-"
    const parts = key.substring(2).split("-"); // "--red-100" -> ["red", "100"]
    const colorName = parts[0]; // "red"
    const variant = parts[1]; // "100"

    // Initialize color object if it doesn't exist
    if (!result[colorName]) {
      result[colorName] = {};
    }

    // Add the variant with var() reference
    result[colorName][variant] = `var(${key})`;
  });

  return result;
}
