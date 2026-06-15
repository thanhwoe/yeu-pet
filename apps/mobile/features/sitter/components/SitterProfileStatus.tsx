import { Body, Heading } from "@/components/ui/Typography";
import { IPetSitter } from "@/interfaces";
import { View } from "react-native";
import { getLocationLine } from "../utils";
import { AvailabilityBadge, SectionLabel } from "./SitterPrimitives";

export const SitterProfileStatus = ({
  profile,
}: {
  profile: IPetSitter | null;
}) => {
  if (!profile) {
    return (
      <View className="mb-16 rounded-24 border border-line-subtle bg-background-surface px-16 py-14">
        <SectionLabel>Sitter profile</SectionLabel>
        <Heading variant="h6" weight="bold" className="mt-4">
          Not set up yet
        </Heading>
        <Body variant="body4" className="mt-4 text-text-muted">
          Use the pencil in the header to create your sitter profile.
        </Body>
      </View>
    );
  }

  return (
    <View className="mb-16 gap-10 rounded-24 border border-line-subtle bg-background-surface px-16 py-14">
      <View className="flex-row items-start justify-between gap-12">
        <View className="flex-1">
          <Heading variant="h6" weight="bold" numberOfLines={1}>
            {profile.displayName || "Profile visible to owners"}
          </Heading>
          <Body variant="body4" className="text-text-muted" numberOfLines={1}>
            {getLocationLine(profile)}
          </Body>
        </View>
        <AvailabilityBadge available={profile.isAvailable} />
      </View>
      <Body variant="body4" className="text-text-muted">
        {profile.isAvailable
          ? "Owners can discover you while your profile is available."
          : "Your profile is paused and hidden from new requests."}
      </Body>
    </View>
  );
};
