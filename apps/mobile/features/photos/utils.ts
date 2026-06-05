import { SCREEN_WIDTH } from "@/constants/common";

export const SCREEN_HORIZONTAL_PADDING = 20;
export const GRID_COLUMNS = 3;
export const GRID_GAP = 16;
export const GRID_ITEM_RADIUS = 12;
export const ITEM_WIDTH =
  (SCREEN_WIDTH -
    SCREEN_HORIZONTAL_PADDING * 2 -
    GRID_GAP * (GRID_COLUMNS - 1)) /
  GRID_COLUMNS;
export const LIMIT = 20;
export const PHOTO_PREVIEW_SIZE = Math.min(SCREEN_WIDTH - 40, 360);
export const PHOTO_COMPOSER_PREVIEW_SIZE = Math.min(SCREEN_WIDTH - 48, 320);
