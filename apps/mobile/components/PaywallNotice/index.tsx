import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { withIconClassName } from "@/hocs/withIconClassName";
import { cn } from "@/utils";
import { CheckCircleIcon, CrownIcon } from "phosphor-react-native";
import { ReactNode } from "react";
import { View } from "react-native";

const CheckCircle = withIconClassName(CheckCircleIcon);
const Crown = withIconClassName(CrownIcon);

export type PaywallNoticeVariant = "blocking" | "compact" | "inline";

interface PaywallNoticeProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  benefits?: string[];
  icon?: ReactNode;
  loading?: boolean;
  onAction?: () => void;
  variant?: PaywallNoticeVariant;
}

export const PaywallNotice = ({
  title = "Premium feature",
  description = "Upgrade to Premium to unlock more room for everyday pet care.",
  actionLabel,
  benefits,
  icon,
  loading,
  onAction,
  variant = "inline",
}: PaywallNoticeProps) => {
  const isBlocking = variant === "blocking";
  const isCompact = variant === "compact";
  const resolvedActionLabel =
    actionLabel ?? (isBlocking ? "Upgrade to Premium" : "Upgrade");
  const visibleBenefits = benefits?.slice(0, 3) ?? [];
  const premiumIcon = icon ?? (
    <Crown
      size={isBlocking ? 28 : 20}
      weight="duotone"
      className="text-status-warning-icon"
    />
  );

  if (isCompact) {
    return (
      <View className="w-full flex-row items-center gap-10 rounded-18 border-hairline border-line-subtle bg-background-surface px-14 py-12">
        <View
          accessibilityElementsHidden
          className="h-38 w-38 items-center justify-center rounded-14 bg-status-warning-surface"
          importantForAccessibility="no-hide-descendants"
        >
          {premiumIcon}
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <Text variant="subhead" className="font-bold" numberOfLines={2}>
            {title}
          </Text>
          <Text
            variant="footnote"
            className="text-text-muted"
            numberOfLines={3}
          >
            {description}
          </Text>
        </View>
        {onAction ? (
          <Button
            size="md"
            variant="outline"
            loading={loading}
            onPress={onAction}
          >
            {resolvedActionLabel}
          </Button>
        ) : null}
      </View>
    );
  }

  return (
    <View
      className={cn(
        "w-full border-hairline border-line-subtle bg-background-surface",
        isBlocking
          ? "gap-18 rounded-24 px-18 py-20 shadow-sm"
          : "gap-12 rounded-20 px-16 py-14",
      )}
    >
      <View
        className={cn(
          "gap-12",
          isBlocking ? "items-center" : "flex-row items-start",
        )}
      >
        <View
          accessibilityElementsHidden
          className={cn(
            "items-center justify-center bg-status-warning-surface",
            isBlocking ? "h-56 w-56 rounded-18" : "h-42 w-42 rounded-14",
          )}
          importantForAccessibility="no-hide-descendants"
        >
          {premiumIcon}
        </View>
        <View className={cn("flex-1 gap-5", isBlocking && "items-center")}>
          <Text
            variant={isBlocking ? "title3" : "heading"}
            className={cn("font-bold", isBlocking && "text-center")}
          >
            {title}
          </Text>
          <Text
            variant="body2"
            className={cn("text-text-muted", isBlocking && "text-center")}
          >
            {description}
          </Text>
        </View>
      </View>

      {isBlocking && visibleBenefits.length ? (
        <View className="gap-10 rounded-18 bg-background-surface-muted px-14 py-13">
          {visibleBenefits.map((benefit) => (
            <View key={benefit} className="flex-row items-start gap-9">
              <View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                <CheckCircle
                  size={18}
                  weight="fill"
                  className="mt-1 text-status-success-icon"
                />
              </View>
              <Text variant="body2" className="flex-1 text-text-secondary">
                {benefit}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {onAction ? (
        <Button
          size={isBlocking ? "lg" : "md"}
          variant={isBlocking ? "primary" : "outline"}
          loading={loading}
          onPress={onAction}
        >
          {resolvedActionLabel}
        </Button>
      ) : null}
    </View>
  );
};
