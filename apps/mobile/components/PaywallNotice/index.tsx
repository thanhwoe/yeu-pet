import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { cn } from "@/utils";
import { View } from "react-native";

interface PaywallNoticeProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  compact?: boolean;
  loading?: boolean;
  onAction?: () => void;
}

export const PaywallNotice = ({
  title = "Premium feature",
  description = "Upgrade to Premium to unlock higher limits and advanced pet-care tools.",
  actionLabel = "Upgrade",
  compact,
  loading,
  onAction,
}: PaywallNoticeProps) => {
  return (
    <View
      className={cn(
        "gap-10 rounded-20 border-hairline border-line-secondary bg-background-card-highlight p-16",
        compact && "rounded-16 p-12",
      )}
    >
      <View className="gap-4">
        <Text variant={compact ? "subhead" : "heading"} className="font-bold">
          {title}
        </Text>
        <Text variant="body2" color="secondary">
          {description}
        </Text>
      </View>
      {!!onAction && (
        <Button
          size="sm"
          variant="secondary"
          loading={loading}
          onPress={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </View>
  );
};
