import { i18n } from "@/i18n";
import { SitterFilters, SitterMinimumRating } from "@/interfaces";

export const MAX_SITTER_FILTER_PRICE = 10_000_000;

export const getSitterRatingOptions = (): {
  label: string;
  value?: SitterMinimumRating;
}[] => [
  { label: i18n.t("sitter.filters.any") },
  { label: "1.0+", value: 1 },
  { label: "2.0+", value: 2 },
  { label: "3.0+", value: 3 },
  { label: "4.0+", value: 4 },
  { label: "5.0", value: 5 },
];

export const SITTER_PRICE_PRESETS = [
  50_000, 100_000, 200_000, 500_000, 1_000_000,
];

export type SitterPriceChoice = "any" | "custom" | number;

export interface SitterDraftFilters {
  city?: string;
  minRating?: SitterMinimumRating;
  priceChoice: SitterPriceChoice;
  customPrice: string;
}

export const createSitterFilterDraft = (
  filters: SitterFilters,
): SitterDraftFilters => {
  const maxPrice = filters.maxPrice;
  const isPreset =
    maxPrice !== undefined && SITTER_PRICE_PRESETS.includes(maxPrice);

  return {
    city: filters.city,
    minRating: filters.minRating,
    priceChoice:
      maxPrice === undefined ? "any" : isPreset ? maxPrice : "custom",
    customPrice: maxPrice !== undefined && !isPreset ? String(maxPrice) : "",
  };
};

export const normalizeSitterFilterDraft = (
  draft: SitterDraftFilters,
): { filters?: SitterFilters; error?: string } => {
  let maxPrice: number | undefined;

  if (typeof draft.priceChoice === "number") {
    maxPrice = draft.priceChoice;
  } else if (draft.priceChoice === "custom" && draft.customPrice.trim()) {
    maxPrice = Number(draft.customPrice);
  }

  if (
    maxPrice !== undefined &&
    (!Number.isFinite(maxPrice) ||
      maxPrice < 0 ||
      maxPrice > MAX_SITTER_FILTER_PRICE)
  ) {
    return {
      error: i18n.t("sitter.filters.invalidPrice"),
    };
  }

  return {
    filters: {
      city: draft.city?.trim() || undefined,
      minRating: draft.minRating,
      maxPrice,
    },
  };
};

export const hasSitterFilters = (filters: SitterFilters) =>
  Boolean(filters.city || filters.minRating || filters.maxPrice !== undefined);

export const formatCompactSitterPrice = (price: number) => {
  if (price === 0) {
    return "0";
  }

  if (price >= 1_000_000) {
    return `${price / 1_000_000}M`;
  }

  return `${price / 1_000}k`;
};
