import { Spinner } from "@/components/ui/Spinner";
import { Text } from "@/components/ui/Text";
import { cn } from "@/utils";
import { ReactNode } from "react";
import { Pressable, View } from "react-native";

interface SettingsRowProps {
  title: string;
  description?: string;
  value?: string;
  children?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  destructive?: boolean;
  className?: string;
}

export function SettingsRow({
  title,
  description,
  value,
  children,
  onPress,
  disabled,
  loading,
  destructive,
  className,
}: SettingsRowProps) {
  const content = (
    <View
      className={cn(
        "min-h-60 flex-row items-center gap-12 border-b border-line-secondary px-16 py-12",
        disabled && "opacity-50",
        className,
      )}
    >
      <View className="flex-1 gap-2">
        <Text
          variant="body2"
          className={cn("font-semibold", destructive && "text-text-negative")}
        >
          {title}
        </Text>
        {description ? (
          <Text variant="footnote" color="secondary">
            {description}
          </Text>
        ) : null}
      </View>
      {loading ? <Spinner size={18} /> : null}
      {value ? (
        <Text variant="footnote" color="secondary" className="text-right">
          {value}
        </Text>
      ) : null}
      {children}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
    >
      {({ pressed }) => (
        <View className={cn(pressed && "bg-background-secondary")}>
          {content}
        </View>
      )}
    </Pressable>
  );
}
