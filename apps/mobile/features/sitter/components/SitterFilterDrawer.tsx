import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { Body, Heading } from "@/components/ui/Typography";
import {
  formatCompactSitterPrice,
  MAX_SITTER_FILTER_PRICE,
  SITTER_PRICE_PRESETS,
  SITTER_RATING_OPTIONS,
  SitterPriceChoice,
} from "@/features/sitter/filters";
import { useSitterFilters } from "@/features/sitter/SitterFiltersContext";
import { withIconClassName } from "@/hocs/withIconClassName";
import { cn } from "@/utils";
import {
  type DrawerContentComponentProps,
  useDrawerStatus,
} from "@react-navigation/drawer";
import { XIcon } from "phosphor-react-native";
import { ReactNode, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VietnamProvinceCitySelect } from "./VietnamProvinceCitySelect";

const X = withIconClassName(XIcon);

export const SitterFilterDrawer = ({
  navigation,
}: DrawerContentComponentProps) => {
  const { draftFilters, discardDraft, resetDraft, updateDraft, applyDraft } =
    useSitterFilters();
  const drawerStatus = useDrawerStatus();
  const [validationError, setValidationError] = useState<string>();

  const updateFilters = (filters: Parameters<typeof updateDraft>[0]) => {
    setValidationError(undefined);
    updateDraft(filters);
  };

  const closeDrawer = () => {
    setValidationError(undefined);
    discardDraft();
    navigation.closeDrawer();
  };

  const handleApply = () => {
    const error = applyDraft();

    if (error) {
      setValidationError(error);
      return;
    }

    navigation.closeDrawer();
  };

  const handlePriceChoice = (choice: SitterPriceChoice) => {
    updateFilters({
      priceChoice: choice,
      customPrice: choice === "custom" ? draftFilters.customPrice : "",
    });
  };

  return (
    <SafeAreaView
      className="h-full bg-background-card"
      edges={["top", "bottom"]}
      accessibilityElementsHidden={drawerStatus === "closed"}
      importantForAccessibility={
        drawerStatus === "closed" ? "no-hide-descendants" : "auto"
      }
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-row items-center justify-between border-b border-line-subtle px-20 pb-16 pt-12">
          <Heading variant="h5" weight="bold">
            Filter sitters
          </Heading>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close sitter filters"
            hitSlop={8}
            onPress={closeDrawer}
            className="h-44 w-44 items-center justify-center rounded-full bg-background-surface-muted"
          >
            <X size={20} className="text-icon-primary" />
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-24 px-20 py-20"
        >
          <FilterSection title="Location">
            <VietnamProvinceCitySelect
              value={draftFilters.city}
              onChange={(city) => updateFilters({ city })}
              emptyLabel="All cities"
              clearLabel="All cities"
            />
          </FilterSection>

          <FilterSection title="Minimum rating">
            <View className="flex-row flex-wrap gap-8">
              {SITTER_RATING_OPTIONS.map((option) => (
                <FilterChip
                  key={option.label}
                  label={option.label}
                  selected={draftFilters.minRating === option.value}
                  onPress={() => updateFilters({ minRating: option.value })}
                />
              ))}
            </View>
          </FilterSection>

          <FilterSection title="Max price">
            <View className="flex-row flex-wrap gap-8">
              <FilterChip
                label="Any"
                selected={draftFilters.priceChoice === "any"}
                onPress={() => handlePriceChoice("any")}
              />
              {SITTER_PRICE_PRESETS.map((price) => (
                <FilterChip
                  key={price}
                  label={`≤ ${formatCompactSitterPrice(price)}`}
                  selected={draftFilters.priceChoice === price}
                  onPress={() => handlePriceChoice(price)}
                />
              ))}
              <FilterChip
                label="Custom"
                selected={draftFilters.priceChoice === "custom"}
                onPress={() => handlePriceChoice("custom")}
              />
            </View>

            {draftFilters.priceChoice === "custom" ? (
              <InputField
                label="Custom max price"
                accessibilityLabel="Custom max price in Vietnamese dong"
                placeholder="Enter amount"
                keyboardType="number-pad"
                inputMode="numeric"
                value={draftFilters.customPrice}
                maxLength={8}
                onChangeText={(value) =>
                  updateFilters({ customPrice: value.replace(/[^0-9]/g, "") })
                }
                suffix={<Body variant="body3">₫</Body>}
                supportText={`Up to ${MAX_SITTER_FILTER_PRICE.toLocaleString("en-US")} ₫`}
                hasError={Boolean(validationError)}
                errorMessage={validationError}
              />
            ) : null}
          </FilterSection>
        </ScrollView>

        <View className="flex-row gap-12 border-t border-line-subtle px-20 pb-4 pt-16">
          <Button
            variant="outline"
            size="md"
            wrapperClassName="flex-1"
            onPress={() => {
              setValidationError(undefined);
              resetDraft();
            }}
          >
            Reset
          </Button>
          <Button
            variant="secondary"
            size="md"
            wrapperClassName="flex-1"
            onPress={handleApply}
          >
            Apply filters
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const FilterSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <View className="gap-10">
    <View className="gap-4">
      <Body variant="body3" weight="bold">
        {title}
      </Body>
      {description ? (
        <Body variant="body4" className="text-text-muted">
          {description}
        </Body>
      ) : null}
    </View>
    {children}
  </View>
);

const FilterChip = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityRole="radio"
    accessibilityState={{ selected }}
    onPress={onPress}
    className={cn(
      "min-h-44 items-center justify-center rounded-full border border-line-subtle bg-background-surface px-14 py-9",
      selected && "border-action-primary bg-action-secondary",
    )}
  >
    <Body
      variant="body3"
      weight="semiBold"
      className={cn(
        "text-text-muted",
        selected && "text-action-secondary-foreground",
      )}
    >
      {label}
    </Body>
  </Pressable>
);
