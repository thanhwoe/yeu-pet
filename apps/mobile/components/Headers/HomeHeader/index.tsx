import { Avatar } from "@/components/ui/Avatar";
import { Text } from "@/components/ui/Text";
import { Heading } from "@/components/ui/Typography";
import { NOTIFICATIONS_KEY } from "@/constants/query-keys";
import { withIconClassName } from "@/hocs/withIconClassName";
import { getNotificationBadgeQuery } from "@/services";
import { useUserInfoStore } from "@/stores/user-info";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { BellRingingIcon } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";

const BellIcon = withIconClassName(BellRingingIcon);

export const HomeHeader = () => {
  const { t } = useTranslation();
  const { user } = useUserInfoStore();
  const router = useRouter();
  const { data: badge } = useQuery({
    queryKey: NOTIFICATIONS_KEY.badge(),
    queryFn: getNotificationBadgeQuery,
  });

  const badgeCount = badge?.count ?? 0;

  return (
    <View className="gap-8 pt-safe bg-background px-20">
      <View className="flex-row justify-between items-center">
        <Heading variant="h4" weight="bold" className="text-text-secondary">
          🐾 YeuPet
        </Heading>
        <View className="flex-row gap-16 items-center">
          <TouchableOpacity
            accessibilityLabel={t("home.header.openNotifications")}
            accessibilityRole="button"
            className="relative bg-background-card p-8 rounded-full"
            onPress={() => router.navigate("/notifications")}
          >
            <BellIcon className="text-icon-primary" size={26} />
            {badgeCount > 0 && (
              <View className="absolute -right-4 -top-4 min-w-18 h-18 rounded-full bg-red-50 px-4 items-center justify-center">
                <Text className="text-[10px] leading-3 font-bold text-white">
                  {badgeCount > 99 ? "99+" : badgeCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <Avatar
            variant="line"
            source={{
              uri: user?.avatarUrl ?? undefined,
            }}
          />
        </View>
      </View>

      <View>
        <Heading variant="h4">
          {t("home.header.greeting", { name: user?.firstName ?? "" })}
        </Heading>
        <Heading variant="h6">{t("home.header.morning")}</Heading>
      </View>
    </View>
  );
};
