import { Tabs } from "@/components/Tabs";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { StateView } from "@/components/ui/StateView";
import { Body } from "@/components/ui/Typography";
import {
  BookingCard,
  BookingListSkeleton,
  StatusFilterRow,
} from "@/features/sitter/components";
import { getBookingRoleTabs } from "@/features/sitter/constants";
import {
  type SitterBookingRole,
  useSitterBookings,
} from "@/features/sitter/hooks/useSitterBookings";
import { type ISitterBooking, type SitterBookingStatus } from "@/interfaces";
import { FlashList, type ListRenderItem } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export const SitterBookingsScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const bookingRoleTabs = useMemo(() => getBookingRoleTabs(), [t]);
  const [bookingRoleTab, setBookingRoleTab] = useState(0);
  const [bookingStatus, setBookingStatus] = useState<
    SitterBookingStatus | undefined
  >();
  const activeRole: SitterBookingRole =
    bookingRoleTab === 0 ? "owner" : "sitter";
  const {
    bookings,
    hasSitterProfile,
    isLoading,
    isFetching,
    isError,
    isRefreshing,
    refetchAll,
  } = useSitterBookings(activeRole, bookingStatus);

  const openBookingDetail = useCallback(
    (booking: ISitterBooking) => {
      router.push({
        pathname: "/sitter-bookings/[id]",
        params: { id: booking.id, role: activeRole },
      });
    },
    [activeRole, router],
  );

  const renderBooking = useCallback<ListRenderItem<ISitterBooking>>(
    ({ item }) => (
      <BookingCard
        booking={item}
        role={activeRole}
        onPress={openBookingDetail}
      />
    ),
    [activeRole, openBookingDetail],
  );

  return (
    <ScreenContainer>
      <View className="gap-14 pb-14 pt-4">
        <Body variant="body3" className="text-text-muted">
          {t("sitter.booking.screen.subtitle")}
        </Body>
        <Tabs
          tabs={bookingRoleTabs}
          active={bookingRoleTab}
          onChange={setBookingRoleTab}
        />
        <StatusFilterRow value={bookingStatus} onChange={setBookingStatus} />
      </View>

      {isLoading || isFetching ? (
        <BookingListSkeleton />
      ) : (
        <FlashList
          data={bookings}
          keyExtractor={(item) => item.id}
          contentContainerClassName="pb-safe"
          showsVerticalScrollIndicator={false}
          renderItem={renderBooking}
          refreshing={isRefreshing}
          onRefresh={refetchAll}
          ListEmptyComponent={() => {
            if (isError) {
              return (
                <StateView
                  variant="error"
                  title={t("sitter.booking.empty.bookingsErrorTitle")}
                  description={t(
                    "sitter.booking.empty.bookingsErrorDescription",
                  )}
                  actionLabel={t("common.retry")}
                  onAction={refetchAll}
                />
              );
            }

            if (activeRole === "sitter" && !hasSitterProfile) {
              return (
                <StateView
                  variant="empty"
                  title={t("sitter.booking.empty.createProfileTitle")}
                  description={t(
                    "sitter.booking.empty.createProfileDescription",
                  )}
                  actionLabel={t("sitter.form.createProfile")}
                  onAction={() => router.push("/sitter/profile")}
                />
              );
            }

            return (
              <StateView
                variant="empty"
                title={t("sitter.booking.empty.noBookingsTitle")}
                description={
                  activeRole === "owner"
                    ? t("sitter.booking.empty.noBookingsOwner")
                    : t("sitter.booking.empty.noBookingsSitter")
                }
                actionLabel={
                  activeRole === "owner"
                    ? t("sitter.booking.empty.findCareAction")
                    : undefined
                }
                onAction={
                  activeRole === "owner"
                    ? () => router.push("/(tabs)/sitter")
                    : undefined
                }
              />
            );
          }}
        />
      )}
    </ScreenContainer>
  );
};
