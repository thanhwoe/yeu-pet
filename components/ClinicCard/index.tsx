import { withIconClassName } from "@/hocs/withIconClassName";
import { IClinic } from "@/interfaces";
import { cn } from "@/utils";
import parsePhoneNumber, { isValidPhoneNumber } from "libphonenumber-js";
import {
  ChatCircleDotsIcon,
  ClockIcon as Clock,
  MapPinIcon,
  PhoneIcon as Phone,
  PhoneCallIcon,
} from "phosphor-react-native";
import { TouchableOpacity, View } from "react-native";
import { Avatar } from "../ui/Avatar";
import { Text } from "../ui/Text";
import { checkIsOpening, makePhoneCall, sendSMS } from "./util";
const ClockIcon = withIconClassName(Clock);
const ChatIcon = withIconClassName(ChatCircleDotsIcon);
const PhoneIcon = withIconClassName(PhoneCallIcon);
const PhoneSimpleIcon = withIconClassName(Phone);
const LocationIcon = withIconClassName(MapPinIcon);
interface ClinicCardProps {
  data: IClinic;
}
export const ClinicCard = ({ data }: ClinicCardProps) => {
  const isOpen = checkIsOpening(data);
  const hasPhone = isValidPhoneNumber(data.phone, "VN");
  const validPhone = hasPhone
    ? parsePhoneNumber(data.phone, "VN")?.formatNational()
    : "";

  return (
    <View className="p-4 border border-gray-100 rounded-2xl bg-white gap-2">
      <View
        className={cn(
          "absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500",
          {
            "bg-green-500": isOpen,
          }
        )}
      />
      <View className="flex-row gap-2">
        <View className="flex-1 gap-2">
          <Text variant="heading">{data.name}</Text>
          <View className="flex-row gap-1 items-center">
            <ClockIcon size={14} className="text-foreground" />
            <Text variant="subhead">Open time: {data.open_time}</Text>
          </View>
          <View className="flex-row gap-1 items-center">
            <ClockIcon size={14} className="text-foreground" />
            <Text variant="subhead">Close time: {data.close_time}</Text>
          </View>
          <View className="flex-row gap-1 items-center">
            <PhoneSimpleIcon size={14} className="text-foreground" />
            <Text variant="subhead">Phone: {data.phone}</Text>
          </View>
        </View>
        <View className="gap-4">
          <Avatar
            source={{
              uri:
                data.avatar_url ||
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            }}
            variant="square"
            size="large"
            className="self-center"
          />
          {hasPhone && (
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => sendSMS(validPhone)}
                className="bg-orange-100 p-2 rounded-full"
              >
                <ChatIcon size={20} className="text-orange-600" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => makePhoneCall(validPhone)}
                className="bg-orange-100 p-2 rounded-full"
              >
                <PhoneIcon size={20} className="text-orange-600" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      <View className="flex-row gap-1 items-center">
        <LocationIcon size={14} className="text-foreground" />
        <Text variant="subhead">Address: {data.address}</Text>
      </View>
    </View>
  );
};
