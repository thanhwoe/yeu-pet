import { AppKeyboardAvoidingView } from "@/components/keyboard";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { StateView } from "@/components/ui/StateView";
import { Body, Heading } from "@/components/ui/Typography";
import {
  SitterProfileForm,
  SitterProfileStatus,
} from "@/features/sitter/components";
import { useSitterProfile } from "@/features/sitter/hooks/useSitterProfile";
import {
  formatRate,
  getLocationLine,
  getServiceSummary,
} from "@/features/sitter/utils";
import { withIconClassName } from "@/hocs/withIconClassName";
import { type IPetSitter } from "@/interfaces";
import { useRouter } from "expo-router";
import {
  CheckCircleIcon,
  CurrencyCircleDollarIcon,
  MapPinIcon,
  StarIcon,
  UserCircleIcon,
} from "phosphor-react-native";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

const CheckCircle = withIconClassName(CheckCircleIcon);
const CurrencyCircleDollar = withIconClassName(CurrencyCircleDollarIcon);
const MapPin = withIconClassName(MapPinIcon);
const Star = withIconClassName(StarIcon);
const UserCircle = withIconClassName(UserCircleIcon);

export const SitterProfileScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const {
    profile,
    hasProfile,
    isLoading,
    isError,
    isSavingProfile,
    refetch,
    saveProfile,
  } = useSitterProfile();

  if (isLoading) {
    return (
      <ScreenContainer>
        <StateView
          variant="loading"
          title={t("sitter.profile.loadingTitle")}
          description={t("sitter.profile.loadingDescription")}
        />
      </ScreenContainer>
    );
  }

  if (isError && !profile) {
    return (
      <ScreenContainer>
        <StateView
          variant="error"
          title={t("sitter.profile.errorTitle")}
          description={t("sitter.profile.errorDescription")}
          actionLabel={t("common.retry")}
          onAction={() => refetch()}
        />
      </ScreenContainer>
    );
  }

  if (isEditing) {
    return (
      <AppKeyboardAvoidingView className="flex-1 bg-background">
        <ScreenContainer scrollEnabled contentContainerClassName="pb-safe">
          <View className="gap-16 px-20 pb-24 pt-4">
            <View className="gap-4">
              <Heading variant="h5" weight="bold">
                {hasProfile
                  ? t("sitter.profile.edit")
                  : t("sitter.profile.become")}
              </Heading>
              <Body variant="body3" className="text-text-muted">
                {t("sitter.profile.formDescription")}
              </Body>
            </View>

            <SitterProfileForm
              defaultValues={profile}
              loading={isSavingProfile}
              onSubmit={async (data) => {
                await saveProfile(data);
                setIsEditing(false);
              }}
            />

            <Button
              variant="outline"
              disabled={isSavingProfile}
              onPress={() => setIsEditing(false)}
            >
              {t("common.cancel")}
            </Button>
          </View>
        </ScreenContainer>
      </AppKeyboardAvoidingView>
    );
  }

  if (!profile) {
    return (
      <ScreenContainer scrollEnabled contentContainerClassName="pb-safe">
        <View className="gap-18 px-20 pb-24 pt-4">
          <View className="gap-6">
            <Heading variant="h5" weight="bold">
              {t("sitter.profile.emptyTitle")}
            </Heading>
            <Body variant="body3" className="text-text-muted">
              {t("sitter.profile.emptyDescription")}
            </Body>
          </View>

          <View className="gap-12 rounded-24 border border-line-subtle bg-background-surface px-16 py-16">
            <BenefitRow>{t("sitter.profile.benefitRequests")}</BenefitRow>
            <BenefitRow>{t("sitter.profile.benefitArea")}</BenefitRow>
            <BenefitRow>{t("sitter.profile.benefitRates")}</BenefitRow>
          </View>

          <Button onPress={() => setIsEditing(true)}>
            {t("sitter.form.createProfile")}
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollEnabled contentContainerClassName="pb-safe">
      <View className="gap-16 px-20 pb-24 pt-4">
        <SitterProfileStatus profile={profile} />
        <ProfileSummary profile={profile} />

        <View className="gap-10">
          <Button onPress={() => setIsEditing(true)}>
            {t("sitter.profile.edit")}
          </Button>
          <Button
            variant="outline"
            onPress={() =>
              router.push({
                pathname: "/sitter/[sitterId]",
                params: { sitterId: profile.id },
              })
            }
          >
            {t("sitter.profile.preview")}
          </Button>
        </View>
      </View>
    </ScreenContainer>
  );
};

const BenefitRow = ({ children }: { children: ReactNode }) => (
  <View className="flex-row items-start gap-10">
    <CheckCircle
      size={18}
      weight="duotone"
      className="mt-1 text-status-success-icon"
    />
    <Body variant="body3" className="flex-1 text-text-muted">
      {children}
    </Body>
  </View>
);

const ProfileSummary = ({ profile }: { profile: IPetSitter }) => {
  const { t } = useTranslation();

  return (
    <View className="gap-12">
      <View className="gap-12 rounded-24 border border-line-subtle bg-background-surface px-16 py-16">
        <ProfileRow
          icon={
            <MapPin
              size={16}
              weight="duotone"
              className="text-feature-sitter-accent"
            />
          }
          label={t("sitter.detail.serviceArea")}
          value={getLocationLine(profile)}
        />
        <ProfileRow
          icon={
            <UserCircle
              size={16}
              weight="duotone"
              className="text-feature-sitter-accent"
            />
          }
          label={t("sitter.profile.serviceDescription")}
          value={getServiceSummary(profile)}
        />
      </View>

      <View className="gap-12 rounded-24 border border-line-subtle bg-background-surface px-16 py-16">
        <ProfileRow
          icon={
            <CurrencyCircleDollar
              size={16}
              weight="duotone"
              className="text-feature-sitter-accent"
            />
          }
          label={t("sitter.detail.hourly")}
          value={formatRate(profile.hourlyRate)}
        />
        <ProfileRow
          icon={
            <CurrencyCircleDollar
              size={16}
              weight="duotone"
              className="text-feature-sitter-accent"
            />
          }
          label={t("sitter.detail.daily")}
          value={formatRate(profile.dailyRate)}
        />
        <ProfileRow
          icon={
            <Star
              size={16}
              weight="duotone"
              className="text-feature-sitter-accent"
            />
          }
          label={t("sitter.profile.rating")}
          value={Number(profile.avgRating || 0).toFixed(1)}
        />
        <ProfileRow
          icon={
            <CheckCircle
              size={16}
              weight="duotone"
              className="text-feature-sitter-accent"
            />
          }
          label={t("sitter.profile.completedBookings")}
          value={String(profile.completedBookingsCount ?? 0)}
        />
      </View>
    </View>
  );
};

const ProfileRow = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) => (
  <View className="flex-row items-start gap-10">
    <View className="h-28 w-28 items-center justify-center rounded-full bg-background-surface-muted">
      {icon}
    </View>
    <View className="min-w-0 flex-1">
      <Body variant="body4" className="text-text-muted">
        {label}
      </Body>
      <Body variant="body3" weight="semiBold">
        {value}
      </Body>
    </View>
  </View>
);
