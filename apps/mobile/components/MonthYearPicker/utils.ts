export const ITEM_HEIGHT = 48;

export const CURRENT_YEAR = new Date().getFullYear();
export const CURRENT_MONTH = new Date().getMonth();
export const YEARS = Array.from(
  { length: 3000 - 1970 + 1 },
  (_, i) => 1970 + i,
);
