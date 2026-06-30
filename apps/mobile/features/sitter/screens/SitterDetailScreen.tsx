import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { StateView } from "@/components/ui/StateView";
import { SitterDetail } from "@/features/sitter/components";
import { useSitterDetail } from "@/features/sitter/hooks/useSitterDetail";
import { useUserInfoStore } from "@/stores/user-info";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export const SitterDetailScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { sitterId } = useLocalSearchParams<{ sitterId?: string }>();
  const currentUser = useUserInfoStore.use.user();
  const { sitter, isLoading, isError, refetch } = useSitterDetail(sitterId);

  if (!sitterId) {
    return (
      <ScreenContainer className="justify-center">
        <StateView
          variant="empty"
          title={t("sitter.detail.missingTitle")}
          description={t("sitter.detail.missingDescription")}
          actionLabel={t("sitter.booking.empty.findCareAction")}
          onAction={() => router.replace("/(tabs)/sitter")}
        />
      </ScreenContainer>
    );
  }

  if (isLoading) {
    return (
      <ScreenContainer className="justify-center">
        <StateView
          variant="loading"
          title={t("sitter.detail.loadingTitle")}
          description={t("sitter.detail.loadingDescription")}
        />
      </ScreenContainer>
    );
  }

  if (isError) {
    return (
      <ScreenContainer className="justify-center">
        <StateView
          variant="error"
          title={t("sitter.detail.loadErrorTitle")}
          description={t("sitter.detail.loadErrorDescription")}
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
          title={t("sitter.detail.emptyTitle")}
          description={t("sitter.detail.emptyDescription")}
          actionLabel={t("sitter.booking.empty.findCareAction")}
          onAction={() => router.replace("/(tabs)/sitter")}
        />
      </ScreenContainer>
    );
  }

  const isOwnProfile = sitter.accountId === currentUser?.id;
  const canRequestCare = sitter.isAvailable && !isOwnProfile;
  const requestUnavailableText = isOwnProfile
    ? t("sitter.detail.ownProfileNotice")
    : sitter.isAvailable
      ? undefined
      : t("sitter.detail.unavailableNotice");

  return (
    <ScreenContainer
      scrollEnabled
      contentContainerClassName="pb-safe-offset-24 pt-4"
    >
      <SitterDetail
        sitter={sitter}
        canRequestCare={canRequestCare}
        requestUnavailableText={requestUnavailableText}
        onRequestCare={() =>
          router.push({
            pathname: "/sitter/request/[sitterId]",
            params: { sitterId: sitter.id },
          })
        }
      />
    </ScreenContainer>
  );
};
