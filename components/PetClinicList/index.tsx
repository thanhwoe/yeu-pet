import { CLINIC_KEY } from "@/constants/query-keys";
import { useLocation } from "@/hooks/useLocation";
import { getListSuggestClinicQuery } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { View } from "react-native";
import { ClinicCard } from "../ClinicCard";
import { openSettings } from "../ClinicCard/util";
import { Skeleton } from "../Skeleton";
import { Button } from "../ui/Button";
import { Text } from "../ui/Text";

export const PetClinicList = () => {
  const { address } = useLocation();

  const { data, isLoading } = useQuery({
    queryKey: CLINIC_KEY.list({ city: address?.city }),
    queryFn: () => getListSuggestClinicQuery(address?.city || ""),
    enabled: !!address,
  });

  const listClinic = data?.data || [];

  const renderContent = () => {
    if (!address) {
      return (
        <View className="items-center justify-center gap-3">
          <Text>Please enable location</Text>
          <Button variant="tonal" onPress={openSettings}>
            Enable
          </Button>
        </View>
      );
    }

    if (address?.isoCountryCode !== "VN") {
      return (
        <View className="items-center justify-center">
          {/* TODO: get list 5 clinics */}
          <Text>Your country is not supported</Text>
        </View>
      );
    }

    if (isLoading) {
      return (
        <View className="gap-3">
          <Skeleton className="h-[186px] rounded-2xl" />
        </View>
      );
    }

    if (listClinic.length === 0) {
      return (
        <View className="items-center justify-center">
          <Text>No clinic found</Text>
        </View>
      );
    }
    return (
      <View className="gap-3">
        {listClinic.map((item, index) => (
          <ClinicCard key={index} data={item} />
        ))}
      </View>
    );
  };

  return (
    <View>
      <View className="flex-row items-center justify-between mb-5">
        <Text variant="title2" className="font-semibold">
          Pet Clinic
        </Text>
        <Link href="/list-clinic">
          <Text variant="subhead">See all</Text>
        </Link>
      </View>

      {renderContent()}
    </View>
  );
};
