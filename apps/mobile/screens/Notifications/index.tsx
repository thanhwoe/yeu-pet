import { Skeleton } from "@/components/Skeleton";
import { Toast } from "@/components/Toast";
import { Button } from "@/components/ui/Button";
import { Image } from "@/components/ui/Image";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Spinner } from "@/components/ui/Spinner";
import { Text } from "@/components/ui/Text";
import { NOTIFICATIONS_KEY } from "@/constants/query-keys";
import { withIconClassName } from "@/hocs/withIconClassName";
import { INotification, INotificationBadge, IPagination } from "@/interfaces";
import {
  getNotificationsQuery,
  markAllNotificationsReadMutation,
  markNotificationReadMutation,
} from "@/services";
import { cn, date, getApiErrorToast } from "@/utils";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Href, router } from "expo-router";
import { type TFunction } from "i18next";
import {
  BellRingingIcon,
  CaretRightIcon,
  ChecksIcon,
} from "phosphor-react-native";
import { useCallback, useMemo, useState } from "react";
import { Pressable, RefreshControl, View } from "react-native";
import { useTranslation } from "react-i18next";

const LIMIT = 20;

const BellIcon = withIconClassName(BellRingingIcon);
const CaretRight = withIconClassName(CaretRightIcon);
const Checks = withIconClassName(ChecksIcon);

const FILTERS = [
  { labelKey: "notifications.filters.all", value: "all" },
  { labelKey: "notifications.filters.unread", value: "unread" },
] as const;

type NotificationFilter = (typeof FILTERS)[number]["value"];

type NotificationsInfiniteData = InfiniteData<
  IPagination<INotification>,
  number
>;

const formatNotificationTime = (value: string | null | undefined, t: TFunction) => {
  if (!value) return t("notifications.time.recently");

  const createdAt = date(value);

  if (!createdAt.isValid()) return t("notifications.time.recently");

  const secondsAgo = date().diff(createdAt, "second");

  if (secondsAgo < 60) {
    return t("notifications.time.justNow");
  }

  if (secondsAgo < 60 * 60 * 24 * 7) {
    return createdAt.fromNow();
  }

  return createdAt.format("ll");
};

const openNotificationLink = (notification: INotification) => {
  const deepLink = notification.deepLink?.trim();

  if (deepLink?.startsWith("/")) {
    router.push(deepLink as Href);
  }
};

const hasUnreadNotification = (
  data: NotificationsInfiniteData | undefined,
  notificationId: string,
) =>
  Boolean(
    data?.pages.some((page) =>
      page.data.some((item) => item.id === notificationId && !item.isRead),
    ),
  );

const markNotificationReadInCache = (
  data: NotificationsInfiniteData | undefined,
  notificationId: string,
  timestamp: string,
) => {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      data: page.data.map((item) =>
        item.id === notificationId && !item.isRead
          ? {
              ...item,
              isRead: true,
              readAt: timestamp,
              updatedAt: timestamp,
            }
          : item,
      ),
    })),
  };
};

const markAllNotificationsReadInCache = (
  data: NotificationsInfiniteData | undefined,
  timestamp: string,
) => {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      data: page.data.map((item) =>
        item.isRead
          ? item
          : {
              ...item,
              isRead: true,
              readAt: timestamp,
              updatedAt: timestamp,
            },
      ),
    })),
  };
};

export const NotificationsScreen = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<NotificationFilter>("all");

  const {
    data: notifications = [],
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: NOTIFICATIONS_KEY.list({ limit: LIMIT }),
    queryFn: ({ pageParam }) =>
      getNotificationsQuery({
        limit: LIMIT,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta.hasNextPage) return undefined;

      return lastPage.meta.page + 1;
    },
    select: (data) => data.pages.flatMap((page) => page.data),
  });

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );
  const filteredNotifications = useMemo(
    () =>
      filter === "unread"
        ? notifications.filter((item) => !item.isRead)
        : notifications,
    [filter, notifications],
  );

  const softInvalidateNotifications = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: NOTIFICATIONS_KEY.lists(),
      refetchType: "inactive",
    });
    queryClient.invalidateQueries({
      queryKey: NOTIFICATIONS_KEY.badge(),
      refetchType: "inactive",
    });
  }, [queryClient]);

  const { mutate: markRead } = useMutation({
    mutationFn: markNotificationReadMutation,
    async onMutate(notificationId) {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY.lists() }),
        queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY.badge() }),
      ]);

      const timestamp = new Date().toISOString();
      const previousNotificationQueries =
        queryClient.getQueriesData<NotificationsInfiniteData>({
          queryKey: NOTIFICATIONS_KEY.lists(),
        });
      const previousBadge = queryClient.getQueryData<INotificationBadge>(
        NOTIFICATIONS_KEY.badge(),
      );
      const wasUnread = previousNotificationQueries.some(([, data]) =>
        hasUnreadNotification(data, notificationId),
      );

      queryClient.setQueriesData<NotificationsInfiniteData>(
        { queryKey: NOTIFICATIONS_KEY.lists() },
        (data) => markNotificationReadInCache(data, notificationId, timestamp),
      );

      if (wasUnread) {
        queryClient.setQueryData<INotificationBadge>(
          NOTIFICATIONS_KEY.badge(),
          (data) =>
            data
              ? {
                  ...data,
                  count: Math.max(data.count - 1, 0),
                }
              : data,
        );
      }

      return { previousBadge, previousNotificationQueries };
    },
    onError(error, _notificationId, context) {
      context?.previousNotificationQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      queryClient.setQueryData(
        NOTIFICATIONS_KEY.badge(),
        context?.previousBadge,
      );
      Toast.error(
        getApiErrorToast(error, {
          textKey: "notifications.error.markOneText",
          titleKey: "notifications.error.markOneTitle",
        }),
      );
    },
    onSettled: softInvalidateNotifications,
  });

  const { mutate: markAllRead, isPending: isMarkingAllRead } = useMutation({
    mutationFn: markAllNotificationsReadMutation,
    async onMutate() {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY.lists() }),
        queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY.badge() }),
      ]);

      const timestamp = new Date().toISOString();
      const previousNotificationQueries =
        queryClient.getQueriesData<NotificationsInfiniteData>({
          queryKey: NOTIFICATIONS_KEY.lists(),
        });
      const previousBadge = queryClient.getQueryData<INotificationBadge>(
        NOTIFICATIONS_KEY.badge(),
      );

      queryClient.setQueriesData<NotificationsInfiniteData>(
        { queryKey: NOTIFICATIONS_KEY.lists() },
        (data) => markAllNotificationsReadInCache(data, timestamp),
      );
      queryClient.setQueryData<INotificationBadge>(
        NOTIFICATIONS_KEY.badge(),
        (data) => (data ? { ...data, count: 0 } : data),
      );

      return { previousBadge, previousNotificationQueries };
    },
    onSuccess() {
      Toast.success({
        title: t("notifications.success.markAllTitle"),
        text: t("notifications.success.markAllText"),
      });
    },
    onError(error, _variables, context) {
      context?.previousNotificationQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      queryClient.setQueryData(
        NOTIFICATIONS_KEY.badge(),
        context?.previousBadge,
      );
      Toast.error(
        getApiErrorToast(error, {
          textKey: "notifications.error.markAllText",
          titleKey: "notifications.error.markAllTitle",
        }),
      );
    },
    onSettled: softInvalidateNotifications,
  });

  const handleEndReached = useCallback(() => {
    if (notifications.length >= LIMIT && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, notifications.length]);

  const renderItem = useCallback<ListRenderItem<INotification>>(
    ({ item }) => (
      <NotificationListItem
        notification={item}
        disabled={isMarkingAllRead}
        onMarkRead={markRead}
      />
    ),
    [isMarkingAllRead, markRead],
  );

  const keyExtractor = useCallback((item: INotification) => item.id, []);

  if (error && !notifications.length) {
    return (
      <ScreenContainer className="gap-16 py-24">
        <NotificationHeader unreadCount={0} />
        <View className="flex-1 items-center justify-center gap-12">
          <BellIcon size={40} className="text-icon-secondary" />
          <Text variant="heading" className="text-center font-medium">
            {t("notifications.error.title")}
          </Text>
          <Text variant="body2" className="text-center text-text-secondary">
            {t("notifications.error.description")}
          </Text>
          <Button onPress={() => refetch()}>{t("common.retry")}</Button>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="gap-14 py-24">
      <NotificationHeader
        unreadCount={unreadCount}
        disabled={!unreadCount || isMarkingAllRead}
        isLoading={isMarkingAllRead}
        onMarkAllRead={markAllRead}
      />
      <NotificationFilters value={filter} onChange={setFilter} />

      <FlashList
        data={filteredNotifications}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        estimatedItemSize={92}
        ItemSeparatorComponent={NotificationSeparator}
        ListEmptyComponent={
          <NotificationEmptyState filter={filter} isLoading={isLoading} />
        }
        ListFooterComponent={
          isFetchingNextPage && notifications.length >= LIMIT ? (
            <View className="items-center py-20">
              <Spinner size={22} />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </ScreenContainer>
  );
};

const NotificationHeader = ({
  unreadCount,
  disabled = true,
  isLoading = false,
  onMarkAllRead,
}: {
  unreadCount: number;
  disabled?: boolean;
  isLoading?: boolean;
  onMarkAllRead?: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center justify-between gap-16">
      <View className="flex-1">
        <Text variant="heading" className="font-bold">
          {t("notifications.header.title")}
        </Text>
        <Text variant="body2" className="text-text-secondary">
          {unreadCount
            ? t("notifications.header.unreadCount", { count: unreadCount })
            : t("notifications.header.allCaughtUp")}
        </Text>
      </View>
      <Pressable
        accessibilityLabel={t("notifications.header.markAllReadAccessibility")}
        accessibilityRole="button"
        accessibilityState={{ disabled, busy: isLoading }}
        disabled={disabled}
        onPress={onMarkAllRead}
        className={cn(
          "h-38 flex-row items-center rounded-full border-hairline border-line-primary bg-background-card px-12",
          disabled && "opacity-50",
        )}
      >
        {isLoading ? (
          <Spinner size={18} />
        ) : (
          <Checks size={18} className="mr-6 text-icon-primary" weight="bold" />
        )}
        <Text variant="footnote" className="font-medium">
          {t("notifications.header.markAllRead")}
        </Text>
      </Pressable>
    </View>
  );
};

const NotificationFilters = ({
  value,
  onChange,
}: {
  value: NotificationFilter;
  onChange: (value: NotificationFilter) => void;
}) => {
  const { t } = useTranslation();

  return (
    <View className="flex-row gap-8">
      {FILTERS.map((item) => {
        const active = item.value === value;

        return (
          <Pressable
            key={item.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(item.value)}
            className={cn(
              "h-36 min-w-72 items-center justify-center rounded-full border bg-background-card border-line-primary px-14",
              active && "border-action-primary bg-action-primary",
            )}
          >
            <Text
              variant="footnote"
              className={cn(
                "font-semibold text-text-muted",
                active && "text-action-primary-foreground",
              )}
            >
              {t(item.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const NotificationListItem = ({
  notification,
  disabled,
  onMarkRead,
}: {
  notification: INotification;
  disabled: boolean;
  onMarkRead: (id: string) => void;
}) => {
  const { t } = useTranslation();
  const isUnread = !notification.isRead;
  const hasDeepLink = Boolean(notification.deepLink?.trim().startsWith("/"));
  const notificationTime = formatNotificationTime(notification.createdAt, t);

  const handlePress = useCallback(() => {
    if (isUnread) {
      onMarkRead(notification.id);
    }

    if (hasDeepLink) {
      openNotificationLink(notification);
    }
  }, [hasDeepLink, isUnread, notification, onMarkRead]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${notification.title}. ${
        notification.body ?? ""
      } ${notificationTime}`}
      accessibilityState={{ disabled, selected: isUnread }}
      className={cn(
        "rounded-16 bg-background-card px-14 py-13",
        isUnread && " border border-line-secondary",
      )}
      disabled={disabled}
      onPress={handlePress}
    >
      <View className="flex-row items-start gap-12">
        <View
          className={cn(
            "h-34 w-34 items-center justify-center rounded-full bg-background-card-highlight",
            !isUnread && "bg-background-secondary",
          )}
        >
          <BellIcon
            size={17}
            weight={isUnread ? "duotone" : "regular"}
            className={cn(
              "text-icon-secondary",
              isUnread && "text-action-primary",
            )}
          />
        </View>
        <View className="min-w-0 flex-1 gap-3">
          <View className="flex-row items-start gap-8">
            <Text
              variant="subhead"
              numberOfLines={1}
              className={cn(
                "min-w-0 flex-1",
                isUnread
                  ? "font-bold text-text-primary"
                  : "font-semibold text-text-secondary",
              )}
            >
              {notification.title}
            </Text>
            {isUnread ? (
              <View
                accessibilityLabel={t("notifications.unreadAccessibility")}
                className="mt-8 h-7 w-7 rounded-full bg-action-primary"
              />
            ) : null}
            {hasDeepLink ? (
              <CaretRight size={16} className="mt-3 text-icon-secondary" />
            ) : null}
          </View>

          {!!notification.body && (
            <Text
              variant="body2"
              numberOfLines={2}
              className="text-text-secondary"
            >
              {notification.body}
            </Text>
          )}

          {notification.imageUrl && (
            <Image
              source={{ uri: notification.imageUrl }}
              className="mt-8 h-88 w-full rounded-14"
            />
          )}

          <Text variant="caption1" className="mt-2 text-text-secondary">
            {notificationTime}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const NotificationEmptyState = ({
  filter,
  isLoading,
}: {
  filter: NotificationFilter;
  isLoading: boolean;
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <View className="gap-10">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton
            key={item}
            className="h-84 rounded-20"
            backgroundClassName="bg-background-surface-muted"
          />
        ))}
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center gap-12 px-24 py-96">
      <View className="h-56 w-56 items-center justify-center rounded-full bg-background-surface-muted">
        <BellIcon size={26} className="text-icon-secondary" />
      </View>
      <Text variant="heading" className="text-center font-medium">
        {filter === "unread"
          ? t("notifications.empty.unreadTitle")
          : t("notifications.empty.allTitle")}
      </Text>
      <Text variant="body2" className="text-center text-text-secondary">
        {filter === "unread"
          ? t("notifications.empty.unreadDescription")
          : t("notifications.empty.allDescription")}
      </Text>
    </View>
  );
};

const NotificationSeparator = () => <View className="h-10" />;
