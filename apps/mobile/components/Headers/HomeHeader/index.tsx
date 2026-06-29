import { Avatar } from "@/components/ui/Avatar";
import { Text } from "@/components/ui/Text";
import { Body, Heading } from "@/components/ui/Typography";
import {
  NOTIFICATIONS_KEY,
  PET_KEY,
  REMINDER_KEY,
} from "@/constants/query-keys";
import { withIconClassName } from "@/hocs/withIconClassName";
import {
  getListPetQuery,
  getListReminderQuery,
  getNotificationBadgeQuery,
} from "@/services";
import { useUserInfoStore } from "@/stores/user-info";
import { date } from "@/utils";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { BellRingingIcon } from "phosphor-react-native";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import {
  getHomeGreetingReminderParams,
  getHomeGreetingSubtitle,
  getHomeGreetingTitle,
} from "./greeting";

const BellIcon = withIconClassName(BellRingingIcon);

export const HomeHeader = () => {
  const { t } = useTranslation();
  const { user } = useUserInfoStore();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(() => date());
  const { data: badge } = useQuery({
    queryKey: NOTIFICATIONS_KEY.badge(),
    queryFn: getNotificationBadgeQuery,
  });
  const {
    data: petData,
    isError: isPetError,
    isLoading: isPetLoading,
  } = useQuery({
    queryKey: PET_KEY.list(),
    queryFn: getListPetQuery,
  });
  const greetingReminderParams = useMemo(
    () => getHomeGreetingReminderParams(currentTime),
    [currentTime],
  );
  const {
    data: overdueReminderData,
    isError: isOverdueReminderError,
    isLoading: isOverdueReminderLoading,
  } = useQuery({
    queryKey: REMINDER_KEY.list(greetingReminderParams.overdue),
    queryFn: () => getListReminderQuery(greetingReminderParams.overdue),
  });
  const {
    data: todayReminderData,
    isError: isTodayReminderError,
    isLoading: isTodayReminderLoading,
  } = useQuery({
    queryKey: REMINDER_KEY.list(greetingReminderParams.today),
    queryFn: () => getListReminderQuery(greetingReminderParams.today),
  });

  useFocusEffect(
    useCallback(() => {
      setCurrentTime(date());
    }, []),
  );

  const badgeCount = badge?.count ?? 0;
  const pets = petData?.data ?? [];
  const petsReady = !isPetLoading && !isPetError;
  const remindersReady =
    !isOverdueReminderLoading &&
    !isTodayReminderLoading &&
    !isOverdueReminderError &&
    !isTodayReminderError;
  const hasPets = petsReady ? pets.length > 0 : true;
  const greetingTitle = getHomeGreetingTitle({
    hasPets,
    now: currentTime,
    petsReady,
    t,
    user,
  });
  const greetingSubtitle = getHomeGreetingSubtitle({
    hasPets,
    now: currentTime,
    overdueCount: overdueReminderData?.meta.total ?? 0,
    petsReady,
    remindersReady,
    t,
    todayCount: todayReminderData?.meta.total ?? 0,
    todayReminders: todayReminderData?.data ?? [],
  });

  return (
    <View className="gap-8 bg-background px-20 pb-4 pt-safe">
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

      <View className="gap-2">
        <Heading variant="h5" weight="bold" numberOfLines={1}>
          {greetingTitle}
        </Heading>
        <Body variant="body3" numberOfLines={2} className="text-text-secondary">
          {greetingSubtitle}
        </Body>
      </View>
    </View>
  );
};
