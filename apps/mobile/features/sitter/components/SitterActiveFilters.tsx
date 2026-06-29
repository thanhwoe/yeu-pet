import { Body } from "@/components/ui/Typography";
import { formatCompactSitterPrice } from "@/features/sitter/filters";
import { useSitterFilters } from "@/features/sitter/SitterFiltersContext";
import { withIconClassName } from "@/hocs/withIconClassName";
import { SitterFilters } from "@/interfaces";
import { XIcon } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView } from "react-native";

const X = withIconClassName(XIcon);

export const SitterActiveFilters = () => {
  const { t } = useTranslation();
  const { appliedFilters, removeAppliedFilter } = useSitterFilters();
  const chips: { key: keyof SitterFilters; label: string }[] = [];

  if (appliedFilters.city) {
    chips.push({ key: "city", label: appliedFilters.city });
  }
  if (appliedFilters.minRating) {
    chips.push({
      key: "minRating",
      label: `${appliedFilters.minRating.toFixed(1)}+`,
    });
  }
  if (appliedFilters.maxPrice !== undefined) {
    chips.push({
      key: "maxPrice",
      label: t("sitter.filters.rateChip", {
        price: formatCompactSitterPrice(appliedFilters.maxPrice),
      }),
    });
  }

  if (!chips.length) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-8 pr-20"
    >
      {chips.map((chip) => (
        <Pressable
          key={chip.key}
          accessibilityRole="button"
          accessibilityLabel={t("sitter.accessibility.removeFilter", {
            label: chip.label,
          })}
          onPress={() => removeAppliedFilter(chip.key)}
          className="min-h-44 flex-row items-center gap-8 rounded-full border border-line-primary bg-background-card px-16 py-8"
        >
          <Body variant="body4" weight="semiBold" className="text-text-muted">
            {chip.label}
          </Body>
          <X size={12} weight="bold" className="text-icon-secondary" />
        </Pressable>
      ))}
    </ScrollView>
  );
};
