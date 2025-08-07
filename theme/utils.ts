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

  for (const key in data) {
    const value = data[key] as keyof typeof colorPalette;

    if (colorPalette[value]) {
      result[key] = `${colorPalette[value]}`;
    } else {
      result[key] = value;
    }
  }

  return result;
}
