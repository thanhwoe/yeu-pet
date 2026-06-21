import { Toast } from "@/components/Toast";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { SitterFilters } from "@/features/sitter/useSitters";
import { withBottomSheetKeyboardEvents } from "@/hocs/withBottomSheetKeyboardEvents";
import { useState } from "react";
import { View } from "react-native";

const BottomSheetInputField = withBottomSheetKeyboardEvents(InputField);

const normalizeFilters = (filters: SitterFilters): SitterFilters | null => {
  const next: SitterFilters = {
    city: filters.city?.trim() || undefined,
    district: filters.district?.trim() || undefined,
    minRating: filters.minRating?.trim() || undefined,
    maxPrice: filters.maxPrice?.trim() || undefined,
  };

  if (next.minRating) {
    const minRating = Number(next.minRating);
    if (!Number.isFinite(minRating) || minRating < 0 || minRating > 5) {
      Toast.error({ text: "Minimum rating must be between 0 and 5." });
      return null;
    }
  }

  if (next.maxPrice) {
    const maxPrice = Number(next.maxPrice);
    if (!Number.isFinite(maxPrice) || maxPrice < 0) {
      Toast.error({ text: "Max price must be a valid positive number." });
      return null;
    }
  }

  return next;
};

export const hasSitterFilters = (filters: SitterFilters) =>
  Boolean(
    filters.city || filters.district || filters.minRating || filters.maxPrice,
  );

export const SitterFilterSheet = ({
  value,
  onApply,
  onClear,
}: {
  value: SitterFilters;
  onApply: (filters: SitterFilters) => void;
  onClear: () => void;
}) => {
  const [city, setCity] = useState(value.city ?? "");
  const [district, setDistrict] = useState(value.district ?? "");
  const [minRating, setMinRating] = useState(value.minRating ?? "");
  const [maxPrice, setMaxPrice] = useState(value.maxPrice ?? "");

  const handleApply = () => {
    const filters = normalizeFilters({
      city,
      district,
      minRating,
      maxPrice,
    });

    if (!filters) return;

    onApply(filters);
  };

  return (
    <View className="gap-16">
      <View className="gap-12 rounded-24  bg-background-surface px-14 py-14">
        <BottomSheetInputField
          label="City"
          placeholder="Ho Chi Minh City"
          value={city}
          onChangeText={setCity}
        />
        <BottomSheetInputField
          label="District"
          placeholder="District 1"
          value={district}
          onChangeText={setDistrict}
        />
        <BottomSheetInputField
          label="Minimum rating"
          placeholder="4"
          keyboardType="numeric"
          value={minRating}
          onChangeText={setMinRating}
        />
        <BottomSheetInputField
          label="Max price"
          placeholder="500000"
          keyboardType="numeric"
          value={maxPrice}
          onChangeText={setMaxPrice}
        />
      </View>

      <View className="flex-row gap-12 self-center">
        <Button className="flex-1" variant="outline" onPress={onClear}>
          Reset
        </Button>
        <Button className="flex-1" onPress={handleApply}>
          Apply filters
        </Button>
      </View>
    </View>
  );
};
