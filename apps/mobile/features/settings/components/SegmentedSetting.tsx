import { Text } from "@/components/ui/Text";
import { cn } from "@/utils";
import { Pressable, View } from "react-native";

interface SegmentedOption<T extends string> {
  label: string;
  value: T;
}

interface SegmentedSettingProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  disabled?: boolean;
  accessibilityLabel: string;
  onChange: (value: T) => void;
}

export function SegmentedSetting<T extends string>({
  options,
  value,
  disabled,
  accessibilityLabel,
  onChange,
}: SegmentedSettingProps<T>) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      className={cn(
        "flex-row rounded-16 bg-background-secondary p-4",
        disabled && "opacity-50",
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled }}
            disabled={disabled || selected}
            onPress={() => onChange(option.value)}
            className={cn(
              "min-h-36 min-w-72 items-center justify-center rounded-12 px-12",
              selected && "bg-background-card shadow-card",
            )}
          >
            <Text
              variant="footnote"
              className={cn(
                "font-semibold",
                selected ? "text-text-primary" : "text-text-secondary",
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
