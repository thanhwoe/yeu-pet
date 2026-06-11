import { Text } from "@/components/ui/Text";
import { cn } from "@/utils";
import { ReactNode } from "react";
import { View } from "react-native";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({
  title,
  description,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <View className={cn("gap-8", className)}>
      <View className="px-2">
        <Text variant="heading" className="font-bold">
          {title}
        </Text>
        {description ? (
          <Text variant="footnote" className="text-text-muted">
            {description}
          </Text>
        ) : null}
      </View>
      <View className="overflow-hidden rounded-22 border-hairline border-line-subtle bg-background-surface shadow-sm">
        {children}
      </View>
    </View>
  );
}
