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
    <View className={cn("gap-10", className)}>
      <View className="gap-2 px-4">
        <Text variant="heading" className="font-bold">
          {title}
        </Text>
        {description ? (
          <Text variant="body2" color="secondary">
            {description}
          </Text>
        ) : null}
      </View>
      <View className="overflow-hidden rounded-20 bg-background-card">
        {children}
      </View>
    </View>
  );
}
