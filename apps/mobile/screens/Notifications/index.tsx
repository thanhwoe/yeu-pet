import { Skeleton } from "@/components/Skeleton";
import { Toast } from "@/components/Toast";
import { Button } from "@/components/ui/Button";
import { Image } from "@/components/ui/Image";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Spinner } from "@/components/ui/Spinner";
import { Text } from "@/components/ui/Text";
import { NOTIFICATIONS_KEY } from "@/constants/query-keys";
import { withIconClassName } from "@/hocs/withIconClassName";
import { INotification } from "@/interfaces";
import {
  deleteNotificationMutation,
  getNotificationsQuery,
  markAllNotificationsReadMutation,
  markNotificationReadMutation,
} from "@/services";
import { cn, date } from "@/utils";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  BellRingingIcon,
  CheckIcon,
  ChecksIcon,
  TrashIcon,
} from "phosphor-react-native";
import { useCallback, useMemo } from "react";
import { RefreshControl, TouchableOpacity, View } from "react-native";

const LIMIT = 20;

const BellIcon = withIconClassName(BellRingingIcon);
const Check = withIconClassName(CheckIcon);
const Checks = withIconClassName(ChecksIcon);
const Trash = withIconClassName(TrashIcon);

type MutationError = {
  errors?: {
    message: string;
  }[];
  message?: string;
};

const getErrorMessage = (error: MutationError, fallback: string) =>
  error.errors?.[0]?.message ?? error.message ?? fallback;

export const NotificationsScreen = () => {
  const queryClient = useQueryClient();

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

  const invalidateNotifications = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY.lists() });
    queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY.badge() });
  }, [queryClient]);

  const { mutate: markRead, isPending: isMarkingRead } = useMutation({
    mutationFn: markNotificationReadMutation,
    onSuccess: invalidateNotifications,
    onError(error: MutationError) {
      Toast.error({
        text: getErrorMessage(error, "Failed to mark notification as read"),
      });
    },
  });

  const { mutate: markAllRead, isPending: isMarkingAllRead } = useMutation({
    mutationFn: markAllNotificationsReadMutation,
    onSuccess() {
      Toast.success({ text: "Notifications marked as read" });
      invalidateNotifications();
    },
    onError(error: MutationError) {
      Toast.error({
        text: getErrorMessage(error, "Failed to mark notifications as read"),
      });
    },
  });

  const { mutate: deleteNotification, isPending: isDeleting } = useMutation({
    mutationFn: deleteNotificationMutation,
    onSuccess() {
      Toast.success({ text: "Notification deleted" });
      invalidateNotifications();
    },
    onError(error: MutationError) {
      Toast.error({
        text: getErrorMessage(error, "Failed to delete notification"),
      });
    },
  });

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const renderItem = useCallback<ListRenderItem<INotification>>(
    ({ item }) => (
      <NotificationListItem
        notification={item}
        disabled={isDeleting || isMarkingRead}
        onMarkRead={markRead}
        onDelete={deleteNotification}
      />
    ),
    [deleteNotification, isDeleting, isMarkingRead, markRead],
  );

  const keyExtractor = useCallback((item: INotification) => item.id, []);

  if (error && !notifications.length) {
    return (
      <ScreenContainer className="gap-16 py-24">
        <NotificationHeader
          unreadCount={0}
          disabled
          isLoading={false}
          onMarkAllRead={markAllRead}
        />
        <View className="flex-1 items-center justify-center gap-12">
          <BellIcon size={40} className="text-icon-secondary" />
          <Text variant="heading" className="text-center font-medium">
            Notifications unavailable
          </Text>
          <Text variant="body2" color="tertiary" className="text-center">
            We could not load your inbox right now.
          </Text>
          <Button onPress={() => refetch()}>Retry</Button>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="gap-16 py-24">
      <NotificationHeader
        unreadCount={unreadCount}
        disabled={!unreadCount || isMarkingAllRead}
        isLoading={isMarkingAllRead}
        onMarkAllRead={markAllRead}
      />

      <FlashList
        data={notifications}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        estimatedItemSize={124}
        ItemSeparatorComponent={NotificationSeparator}
        ListEmptyComponent={<NotificationEmptyState isLoading={isLoading} />}
        ListFooterComponent={
          isFetchingNextPage ? (
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
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </ScreenContainer>
  );
};

const NotificationHeader = ({
  unreadCount,
  disabled,
  isLoading,
  onMarkAllRead,
}: {
  unreadCount: number;
  disabled: boolean;
  isLoading: boolean;
  onMarkAllRead: () => void;
}) => (
  <View className="flex-row items-center justify-between gap-16">
    <View className="flex-1">
      <Text variant="heading" className="font-semibold">
        Inbox
      </Text>
      <Text variant="body2" color="tertiary">
        {unreadCount ? `${unreadCount} unread` : "All caught up"}
      </Text>
    </View>
    <TouchableOpacity
      accessibilityLabel="Mark all notifications as read"
      accessibilityRole="button"
      activeOpacity={0.82}
      disabled={disabled}
      onPress={onMarkAllRead}
      className={cn(
        "h-44 flex-row items-center gap-8 rounded-full bg-background-card px-14",
        disabled && "opacity-50",
      )}
    >
      {isLoading ? (
        <Spinner size={18} />
      ) : (
        <Checks size={18} className="text-icon-primary" weight="bold" />
      )}
      <Text variant="footnote" className="font-medium">
        Mark all
      </Text>
    </TouchableOpacity>
  </View>
);

const NotificationListItem = ({
  notification,
  disabled,
  onMarkRead,
  onDelete,
}: {
  notification: INotification;
  disabled: boolean;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const isUnread = !notification.isRead;

  const handleMarkRead = useCallback(() => {
    if (isUnread) {
      onMarkRead(notification.id);
    }
  }, [isUnread, notification.id, onMarkRead]);

  const handleDelete = useCallback(() => {
    onDelete(notification.id);
  }, [notification.id, onDelete]);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.82}
      className={cn(
        "rounded-16 border-hairline border-line-primary bg-background-card p-16",
        isUnread && "border-line-secondary bg-background-card-highlight",
      )}
      disabled={!isUnread || disabled}
      onPress={handleMarkRead}
    >
      <View className="flex-row gap-12">
        <View
          className={cn(
            "h-40 w-40 items-center justify-center rounded-full bg-background-secondary",
            isUnread && "bg-background-primary",
          )}
        >
          <BellIcon
            size={20}
            weight={isUnread ? "fill" : "regular"}
            className={cn(
              "text-icon-primary",
              isUnread && "text-icon-primary-inverse",
            )}
          />
        </View>
        <View className="flex-1 gap-6">
          <View className="flex-row items-start justify-between gap-8">
            <Text
              variant="subhead"
              numberOfLines={2}
              className={cn("flex-1 font-semibold", !isUnread && "opacity-80")}
            >
              {notification.title}
            </Text>
            {isUnread && (
              <View className="mt-7 h-8 w-8 rounded-full bg-red-50" />
            )}
          </View>

          {!!notification.body && (
            <Text
              variant="body2"
              color="tertiary"
              numberOfLines={3}
              className="leading-5"
            >
              {notification.body}
            </Text>
          )}

          {notification.imageUrl && (
            <Image
              source={{ uri: notification.imageUrl }}
              className="mt-4 h-88 w-full rounded-12"
            />
          )}

          <View className="mt-4 flex-row items-center justify-between gap-12">
            <Text variant="caption1" color="tertiary">
              {notification.createdAt
                ? date(notification.createdAt).fromNow()
                : "Recently"}
            </Text>
            <View className="flex-row items-center gap-8">
              {isUnread && (
                <TouchableOpacity
                  accessibilityLabel="Mark notification as read"
                  accessibilityRole="button"
                  activeOpacity={0.82}
                  disabled={disabled}
                  onPress={handleMarkRead}
                  className="h-34 w-34 items-center justify-center rounded-full bg-background-card"
                >
                  <Check
                    size={18}
                    className="text-icon-primary"
                    weight="bold"
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                accessibilityLabel="Delete notification"
                accessibilityRole="button"
                activeOpacity={0.82}
                disabled={disabled}
                onPress={handleDelete}
                className="h-34 w-34 items-center justify-center rounded-full bg-background-negative-foreground"
              >
                <Trash size={18} className="text-icon-negative" weight="bold" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const NotificationEmptyState = ({ isLoading }: { isLoading: boolean }) => {
  if (isLoading) {
    return (
      <View className="gap-12">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-112 rounded-16" />
        ))}
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center gap-12 px-24 py-96">
      <View className="h-64 w-64 items-center justify-center rounded-full bg-background-card">
        <BellIcon size={30} className="text-icon-secondary" />
      </View>
      <Text variant="heading" className="text-center font-medium">
        No notifications
      </Text>
      <Text variant="body2" color="tertiary" className="text-center">
        Updates about reminders, bookings, and account activity will show here.
      </Text>
    </View>
  );
};

const NotificationSeparator = () => <View className="h-12" />;
