import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Text } from "@/components/ui/Text";
import { SUBSCRIPTION_KEY } from "@/constants/query-keys";
import { ThemeToggle } from "@/features/settings/components/ThemeToggle";
import { useLogout } from "@/hooks/useLogout";
import {
  getEntitlementsQuery,
  mockDowngradeSubscriptionMutation,
  mockUpgradeSubscriptionMutation,
} from "@/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { View } from "react-native";

export default function TabTwoScreen() {
  const { loading, logout } = useLogout();
  const queryClient = useQueryClient();
  const { data: entitlements, isLoading: isLoadingEntitlements } = useQuery({
    queryKey: SUBSCRIPTION_KEY.entitlements(),
    queryFn: getEntitlementsQuery,
  });
  const invalidateSubscription = () => {
    queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEY.all });
  };
  const { mutate: mockUpgrade, isPending: isUpgrading } = useMutation({
    mutationFn: mockUpgradeSubscriptionMutation,
    onSuccess: invalidateSubscription,
  });
  const { mutate: mockDowngrade, isPending: isDowngrading } = useMutation({
    mutationFn: mockDowngradeSubscriptionMutation,
    onSuccess: invalidateSubscription,
  });

  return (
    <ScreenContainer className="gap-16 py-16">
      <View className="gap-3 rounded-20 bg-background-card p-16">
        <Text variant="heading" className="font-bold">
          Subscription
        </Text>
        <Text variant="body2" color="secondary">
          {isLoadingEntitlements
            ? "Loading plan..."
            : `${entitlements?.tier ?? "free"} plan · ${entitlements?.usage.pets ?? 0}/${entitlements?.limits.maxPets ?? 0} pets · ${entitlements?.usage.aiMessagesThisMonth ?? 0}/${entitlements?.limits.aiMessagesPerMonth ?? 0} AI messages`}
        </Text>
        <View className="flex-row gap-10">
          <Button
            size="sm"
            variant="secondary"
            loading={isUpgrading}
            onPress={() => mockUpgrade()}
          >
            Mock Upgrade
          </Button>
          <Button
            size="sm"
            variant="outline"
            loading={isDowngrading}
            onPress={() => mockDowngrade()}
          >
            Mock Downgrade
          </Button>
        </View>
      </View>
      <Text variant="heading" className="font-bold">
        Settings
      </Text>
      <Button onPress={logout} loading={loading}>
        Logout
      </Button>
      <ThemeToggle />
    </ScreenContainer>
  );
}
