import { withIconClassName } from "@/hocs/withIconClassName";
import { IClinic } from "@/interfaces";
import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js";
import {
  ClockIcon as Clock,
  MapPinIcon,
  PhoneIcon as Phone,
} from "phosphor-react-native";
import { memo, useCallback, useMemo } from "react";
import { View } from "react-native";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Text } from "../ui/Text";
import { makePhoneCall, sendSMS } from "./util";

const ClockIcon = withIconClassName(Clock);
const PhoneSimpleIcon = withIconClassName(Phone);
const LocationIcon = withIconClassName(MapPinIcon);

interface ClinicCardProps {
  data: IClinic;
}
export const SpaCard = memo(({ data }: ClinicCardProps) => {
  const validPhone = useMemo(() => {
    if (!data.phone || !isValidPhoneNumber(data.phone, "VN")) {
      return undefined;
    }

    return parsePhoneNumberFromString(data.phone, "VN")?.formatNational();
  }, [data.phone]);

  const handleSms = useCallback(() => sendSMS(validPhone), [validPhone]);
  const handleCall = useCallback(() => makePhoneCall(validPhone), [validPhone]);

  return (
    <View className="rounded-2xl bg-white mb-3 p-3 gap-2">
      <View className="flex-row items-center gap-3">
        <Avatar
          source={{
            uri:
              data.avatar_url ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          }}
          size="large"
        />
        <View>
          <Text variant="heading">{data.name}</Text>
          <View className="flex-row items-center gap-1">
            <ClockIcon size={14} className="text-foreground" />
            <Text variant="subhead">
              {data.open_time} - {data.close_time}
            </Text>
          </View>
        </View>
      </View>
      <View className="flex-row items-center gap-1">
        <PhoneSimpleIcon size={14} className="text-foreground" />
        <Text variant="subhead">{data.phone}</Text>
      </View>
      <View className="flex-row items-center gap-1">
        <LocationIcon size={14} className="text-foreground" />
        <Text variant="subhead" className="flex-shrink">
          {data.address}
        </Text>
      </View>
      <View className="flex-row gap-2">
        <Button className="flex-1" onPress={handleSms}>
          Call
        </Button>
        <Button
          className="flex-1"
          variant="secondary"
          onPress={handleCall}
        >
          Chat
        </Button>
      </View>
    </View>
  );
});

SpaCard.displayName = "SpaCard";
