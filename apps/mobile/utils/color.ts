export const hexToRgba = (hex: string, opacity: number): string => {
  const clean = hex.replace("#", "");

  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("") // expand shorthand: "abc" → "aabbcc"
      : clean;

  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);

  const a = Math.min(1, Math.max(0, opacity)); // clamp 0–1

  return `rgba(${r}, ${g}, ${b}, ${a})`;
};
