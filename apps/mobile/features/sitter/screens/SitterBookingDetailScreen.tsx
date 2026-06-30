import { Popup } from "@/components/Popup";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { StateView } from "@/components/ui/StateView";
import { Body } from "@/components/ui/Typography";
import {
  type ISitterCancelForm,
  type ISitterReviewFormValues,
} from "@/constants/validation";
import {
  BookingDetail,
  CancelForm,
  ReviewForm,
} from "@/features/sitter/components";
import { useSitterBookingDetailRoute } from "@/features/sitter/hooks/useSitterBookingDetailRoute";
import { type ISitterBooking } from "@/interfaces";
import { useUserInfoStore } from "@/stores/user-info";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

type BookingDetailRole = "owner" | "sitter";

const getRouteRole = (role?: string): BookingDetailRole | undefined => {
  if (role === "owner" || role === "sitter") {
    return role;
  }

  return undefined;
};

const getBookingRole = ({
  booking,
  currentUserId,
  fallbackRole,
}: {
  booking: ISitterBooking | null;
  currentUserId?: string;
  fallbackRole?: BookingDetailRole;
}): BookingDetailRole => {
  if (booking?.accountId && booking.accountId === currentUserId) {
    return "owner";
  }

  if (
    booking?.sitter?.accountId &&
    booking.sitter.accountId === currentUserId
  ) {
    return "sitter";
  }

  return fallbackRole ?? "owner";
};

export const SitterBookingDetailScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id, role } = useLocalSearchParams<{ id?: string; role?: string }>();
  const currentUser = useUserInfoStore.use.user();
  const fallbackRole = getRouteRole(role);
  const [bookingForCancel, setBookingForCancel] =
    useState<ISitterBooking | null>(null);
  const [bookingForComplete, setBookingForComplete] =
    useState<ISitterBooking | null>(null);
  const [bookingForReview, setBookingForReview] =
    useState<ISitterBooking | null>(null);
  const {
    booking,
    isLoading,
    isError,
    refetch,
    acceptBooking,
    rejectBooking,
    completeBooking,
    cancelBooking,
    createReview,
    isMutatingBooking,
    isCreatingReview,
  } = useSitterBookingDetailRoute(id);

  const bookingRole = useMemo(
    () =>
      getBookingRole({
        booking,
        currentUserId: currentUser?.id,
        fallbackRole,
      }),
    [booking, currentUser?.id, fallbackRole],
  );

  const goToBookings = () => router.replace("/sitter/bookings");

  const handleCancelBooking = async (data: ISitterCancelForm) => {
    if (!bookingForCancel) return;

    await cancelBooking({ id: bookingForCancel.id, reason: data.reason });
    setBookingForCancel(null);
  };

  const handleCompleteBooking = async () => {
    if (!bookingForComplete || isMutatingBooking) return;

    try {
      await completeBooking(bookingForComplete.id);
    } catch {
      // The route hook owns the translated error toast.
    } finally {
      setBookingForComplete(null);
    }
  };

  const handleCreateReview = async (data: ISitterReviewFormValues) => {
    if (!bookingForReview) return;

    await createReview({
      bookingId: bookingForReview.id,
      sitterId: bookingForReview.sitterId,
      rating: Number(data.rating) as 1 | 2 | 3 | 4 | 5,
      comment: data.comment,
    });
    setBookingForReview(null);
  };

  if (!id) {
    return (
      <ScreenContainer className="justify-center">
        <StateView
          variant="empty"
          title={t("sitter.booking.detail.missingTitle")}
          description={t("sitter.booking.detail.missingDescription")}
          actionLabel={t("sitter.booking.tabs.bookings")}
          onAction={goToBookings}
        />
      </ScreenContainer>
    );
  }

  if (isLoading) {
    return (
      <ScreenContainer className="justify-center">
        <StateView
          variant="loading"
          title={t("sitter.booking.detail.loadingTitle")}
          description={t("sitter.booking.detail.loadingDescription")}
        />
      </ScreenContainer>
    );
  }

  if (isError) {
    return (
      <ScreenContainer className="justify-center">
        <StateView
          variant="error"
          title={t("sitter.booking.detail.loadErrorTitle")}
          description={t("sitter.booking.detail.loadErrorDescription")}
          actionLabel={t("common.retry")}
          onAction={() => refetch()}
        />
      </ScreenContainer>
    );
  }

  if (!booking) {
    return (
      <ScreenContainer className="justify-center">
        <StateView
          variant="empty"
          title={t("sitter.booking.detail.emptyTitle")}
          description={t("sitter.booking.detail.emptyDescription")}
          actionLabel={t("sitter.booking.tabs.bookings")}
          onAction={goToBookings}
        />
      </ScreenContainer>
    );
  }

  return (
    <>
      <ScreenContainer
        scrollEnabled
        contentContainerClassName="pb-safe-offset-24 pt-4"
      >
        <BookingDetail
          booking={booking}
          role={bookingRole}
          loading={isMutatingBooking}
          onOpenMessages={(item) =>
            router.push({
              pathname: "/sitter-bookings/[id]/chat",
              params: { id: item.id },
            })
          }
          onCancel={setBookingForCancel}
          onReview={setBookingForReview}
          onAccept={(item) => {
            void acceptBooking(item.id);
          }}
          onComplete={setBookingForComplete}
          onReject={(item) => {
            Alert.alert(
              t("sitter.booking.rejectAlert.title"),
              t("sitter.booking.rejectAlert.message"),
              [
                {
                  text: t("sitter.booking.rejectAlert.keep"),
                  style: "cancel",
                },
                {
                  text: t("sitter.booking.rejectAlert.confirm"),
                  style: "destructive",
                  onPress: () => {
                    void rejectBooking(item.id);
                  },
                },
              ],
            );
          }}
        />
      </ScreenContainer>

      <BottomSheet
        visible={!!bookingForCancel}
        onDismiss={() => setBookingForCancel(null)}
        titleElement={
          <Body weight="semiBold">{t("sitter.booking.actions.cancel")}</Body>
        }
        useScrollView
        keyboardBehavior="interactive"
      >
        <CancelForm
          loading={isMutatingBooking}
          onSubmit={handleCancelBooking}
        />
      </BottomSheet>

      <BottomSheet
        visible={!!bookingForReview}
        onDismiss={() => setBookingForReview(null)}
        titleElement={
          <Body weight="semiBold">{t("sitter.screen.reviewSitter")}</Body>
        }
        useScrollView
        keyboardBehavior="interactive"
      >
        <ReviewForm loading={isCreatingReview} onSubmit={handleCreateReview} />
      </BottomSheet>

      <Popup
        visible={!!bookingForComplete}
        variant="confirm"
        title={t("sitter.booking.completeConfirm.title")}
        description={t("sitter.booking.completeConfirm.description")}
        cancelLabel={t("sitter.booking.completeConfirm.cancel")}
        confirmLabel={t("sitter.booking.completeConfirm.confirm")}
        loading={isMutatingBooking}
        onCancel={() => setBookingForComplete(null)}
        onConfirm={handleCompleteBooking}
      />
    </>
  );
};
