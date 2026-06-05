import { cn } from "@/utils";
import { Pressable, View } from "react-native";

interface SettingToggleProps {
  value: boolean;
  disabled?: boolean;
  label: string;
  onChange: (value: boolean) => void;
}

export function SettingToggle({
  value,
  disabled,
  label,
  onChange,
}: SettingToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onChange(!value)}
      className={cn(
        "h-32 w-56 justify-center rounded-full p-3",
        value ? "bg-background-primary" : "bg-background-tertiary",
        disabled && "opacity-50",
      )}
    >
      <View
        className={cn(
          "h-26 w-26 rounded-full bg-background-card shadow-card",
          value && "translate-x-24",
        )}
      />
    </Pressable>
  );
}
