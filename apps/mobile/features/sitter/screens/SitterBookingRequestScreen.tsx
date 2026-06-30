import { AppKeyboardAvoidingView } from "@/components/keyboard";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { StateView } from "@/components/ui/StateView";
import { Body, Heading } from "@/components/ui/Typography";
import { BookingRequestForm } from "@/features/sitter/components";
import { useSitterBookingRequest } from "@/features/sitter/hooks/useSitterBookingRequest";
import { type ISitterBookingForm } from "@/interfaces";
import { useUserInfoStore } from "@/stores/user-info";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export const SitterBookingRequestScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { sitterId } = useLocalSearchParams<{ sitterId?: string }>();
  const currentUser = useUserInfoStore.use.user();
  const {
    sitter,
    pets,
    isLoading,
    isError,
    isCreatingBooking,
    refetch,
    createBooking,
  } = useSitterBookingRequest(sitterId);

  const goToExplore = () => router.replace("/(tabs)/sitter");

  const submitBookingRequest = async (data: ISitterBookingForm) => {
    try {
      const booking = await createBooking(data);

      if (booking?.id) {
        router.replace({
          pathname: "/sitter-bookings/[id]",
          params: { id: booking.id, role: "owner" },
        });
        return;
      }

      router.replace("/sitter/bookings");
    } catch {
      // The mutation hook owns the translated error toast.
    }
  };

  if (!sitterId) {
    return (
      <ScreenContainer className="justify-center">
        <StateView
          variant="empty"
          title={t("sitter.request.missingTitle")}
          description={t("sitter.request.missingDescription")}
          actionLabel={t("sitter.booking.empty.findCareAction")}
          onAction={goToExplore}
        />
      </ScreenContainer>
    );
  }

  if (isLoading) {
    return (
      <ScreenContainer className="justify-center">
        <StateView
          variant="loading"
          title={t("sitter.request.loadingTitle")}
          description={t("sitter.request.loadingDescription")}
        />
      </ScreenContainer>
    );
  }

  if (isError) {
    return (
      <ScreenContainer className="justify-center">
        <StateView
          variant="error"
          title={t("sitter.request.loadErrorTitle")}
          description={t("sitter.request.loadErrorDescription")}
          actionLabel={t("common.retry")}
          onAction={() => refetch()}
        />
      </ScreenContainer>
    );
  }

  if (!sitter) {
    return (
      <ScreenContainer className="justify-center">
        <StateView
          variant="empty"
          title={t("sitter.request.emptyTitle")}
          description={t("sitter.request.emptyDescription")}
          actionLabel={t("sitter.booking.empty.findCareAction")}
          onAction={goToExplore}
        />
      </ScreenContainer>
    );
  }

  if (sitter.accountId === currentUser?.id) {
    return (
      <ScreenContainer className="justify-center">
        <StateView
          variant="empty"
          title={t("sitter.request.ownProfileTitle")}
          description={t("sitter.request.ownProfileDescription")}
          actionLabel={t("sitter.booking.empty.findCareAction")}
          onAction={goToExplore}
        />
      </ScreenContainer>
    );
  }

  if (!sitter.isAvailable) {
    return (
      <ScreenContainer className="justify-center">
        <StateView
          variant="empty"
          title={t("sitter.request.unavailableTitle")}
          description={t("sitter.request.unavailableDescription")}
          actionLabel={t("sitter.booking.empty.findCareAction")}
          onAction={goToExplore}
        />
      </ScreenContainer>
    );
  }

  return (
    <AppKeyboardAvoidingView className="flex-1 bg-background">
      <ScreenContainer
        scrollEnabled
        contentContainerClassName="pb-safe-offset-24 pt-4"
      >
        <View className="gap-4 px-20 pb-12">
          <Heading variant="h5" weight="bold">
            {t("sitter.request.title")}
          </Heading>
          <Body variant="body3" className="text-text-muted">
            {t("sitter.request.subtitle")}
          </Body>
        </View>

        <BookingRequestForm
          sitter={sitter}
          pets={pets}
          loading={isCreatingBooking}
          onSubmit={submitBookingRequest}
        />
      </ScreenContainer>
    </AppKeyboardAvoidingView>
  );
};
