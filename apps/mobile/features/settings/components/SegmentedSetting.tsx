import { Text } from "@/components/ui/Text";
import { useColorScheme } from "@/hooks/useColorScheme";
import { darkColorTheme, lightColorTheme } from "@/theme/colors";
import { getColors } from "@/theme/utils";
import { cn } from "@/utils";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

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
  const { colorScheme } = useColorScheme();
  const theme = useMemo(
    () =>
      getColors(colorScheme === "dark" ? darkColorTheme : lightColorTheme),
    [colorScheme],
  );
  const colors = {
    selectedBackground: theme["--background-surface"],
    mutedBackground: theme["--background-surface-muted"],
    selectedText: theme["--text-primary"],
    mutedText: theme["--text-muted"],
    shadow: theme["--shadow-primary"],
  };

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      className={cn("flex-row rounded-16 p-4", disabled && "opacity-50")}
      style={{ backgroundColor: colors.mutedBackground }}
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityLabel={`${accessibilityLabel}: ${option.label}`}
            accessibilityState={{ selected, disabled }}
            disabled={disabled || selected}
            onPress={() => onChange(option.value)}
            style={[
              styles.option,
              selected && {
                backgroundColor: colors.selectedBackground,
                shadowColor: colors.shadow,
              },
              selected && styles.selectedOption,
            ]}
          >
            <Text
              variant="footnote"
              className="font-semibold"
              style={{
                color: selected ? colors.selectedText : colors.mutedText,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  option: {
    alignItems: "center",
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 36,
    minWidth: 72,
    paddingHorizontal: 12,
  },
  selectedOption: {
    elevation: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
});
