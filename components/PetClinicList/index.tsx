import { withIconClassName } from "@/hocs/withIconClassName";
import {
  ChatCircleDotsIcon,
  ClockIcon as Clock,
  MapPinIcon,
  PhoneCallIcon,
} from "phosphor-react-native";
import { TouchableOpacity, View } from "react-native";
import { Avatar } from "../ui/Avatar";
import { Text } from "../ui/Text";

const ClockIcon = withIconClassName(Clock);
const ChatIcon = withIconClassName(ChatCircleDotsIcon);
const PhoneIcon = withIconClassName(PhoneCallIcon);
const LocationIcon = withIconClassName(MapPinIcon);

export const PetClinicList = () => {
  return (
    <View>
      <View className="flex-row items-center justify-between mb-5">
        <Text variant="title2" className="font-semibold">
          Pet Clinic
        </Text>
        <TouchableOpacity>
          <Text variant="subhead">See all</Text>
        </TouchableOpacity>
      </View>
      <View className="gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <View
            className="flex-row p-4 border border-gray-100 rounded-2xl bg-white gap-4 items-center"
            key={index}
          >
            <Avatar
              source={{
                uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              }}
              variant="square"
              size="huge"
              className="self-center"
            />
            <View className="gap-2 flex-1">
              <Text className="font-semibold">Name</Text>
              <Text variant="subhead" className="uppercase font-bold">
                open / close
              </Text>
              <View className="flex-row flex-1 items-center gap-1">
                <ClockIcon size={12} weight="bold" />
                <Text variant={"subhead"}>Opens at 9:00 am</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <LocationIcon
                  size={14}
                  weight="bold"
                  className="text-gray-400"
                />
                <Text className="text-gray-400">Address</Text>
              </View>
            </View>
            <View className="gap-4 ml-auto">
              <TouchableOpacity className="bg-orange-100 p-2 rounded-full">
                <ChatIcon size={20} className="text-orange-600" />
              </TouchableOpacity>
              <TouchableOpacity className="bg-orange-100 p-2 rounded-full">
                <PhoneIcon size={20} className="text-orange-600" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};
