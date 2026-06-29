import { Body, Heading } from "@/components/ui/Typography";
import { IPetSitter } from "@/interfaces";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { getLocationLine } from "../utils";
import { AvailabilityBadge, SectionLabel } from "./SitterPrimitives";

export const SitterProfileStatus = ({
  profile,
}: {
  profile: IPetSitter | null;
}) => {
  const { t } = useTranslation();

  if (!profile) {
    return (
      <View className="mb-16 rounded-24 border border-line-subtle bg-background-surface px-16 py-14">
        <SectionLabel>{t("sitter.profile.profileTitle")}</SectionLabel>
        <Heading variant="h6" weight="bold" className="mt-4">
          {t("sitter.profile.statusNotSetTitle")}
        </Heading>
        <Body variant="body4" className="mt-4 text-text-muted">
          {t("sitter.profile.statusNotSetDescription")}
        </Body>
      </View>
    );
  }

  return (
    <View className="mb-16 gap-10 rounded-24 border border-line-subtle bg-background-surface px-16 py-14">
      <View className="flex-row items-start justify-between gap-12">
        <View className="flex-1">
          <Heading variant="h6" weight="bold" numberOfLines={1}>
            {profile.displayName || t("sitter.profile.statusFallbackName")}
          </Heading>
          <Body variant="body4" className="text-text-muted" numberOfLines={1}>
            {getLocationLine(profile)}
          </Body>
        </View>
        <AvailabilityBadge available={profile.isAvailable} />
      </View>
      <Body variant="body4" className="text-text-muted">
        {profile.isAvailable
          ? t("sitter.profile.statusDescriptionAvailable")
          : t("sitter.profile.statusDescriptionPaused")}
      </Body>
    </View>
  );
};
