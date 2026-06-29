import { Button } from "@/components/ui/Button";
import { Body, Heading } from "@/components/ui/Typography";
import { ReactNode } from "react";
import { Pressable, View } from "react-native";

export const DashboardCard = ({
  title,
  subtitle: _subtitle,
  icon,
  headerAccessory,
  children,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  headerAccessory?: ReactNode;
  children: ReactNode;
}) => (
  <View className="mx-20 mt-16 rounded-24 border border-line-subtle bg-background-card px-16 py-16">
    <View className="flex-row items-center gap-12">
      {icon}
      <View className="flex-1">
        <Heading variant="h6" weight="bold">
          {title}
        </Heading>
      </View>
      {headerAccessory}
    </View>
    <View className="mt-14">{children}</View>
  </View>
);

export const DashboardState = ({
  icon: _icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) => (
  <View className="items-center gap-8 py-2">
    <Heading variant="h6" weight="semiBold" className="text-center mt-20">
      {title}
    </Heading>
    <Body variant="body4" className="max-w-280 text-center text-text-muted">
      {description}
    </Body>
    <Button
      size="sm"
      variant="outline"
      wrapperClassName="mt-4 self-center"
      onPress={onAction}
    >
      {actionLabel}
    </Button>
  </View>
);

export const DashboardAction = ({
  label,
  accessibilityLabel,
  onPress,
}: {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    onPress={onPress}
    className="mt-8 min-h-44 flex-row items-center justify-center rounded-14 px-4"
  >
    <Body variant="body3" weight="semiBold" className="text-text-link">
      {label}
    </Body>
  </Pressable>
);
