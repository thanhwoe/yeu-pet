import { Avatar } from "@/components/ui/Avatar";
import { withIconClassName } from "@/hocs/withIconClassName";
import { useUserInfoStore } from "@/stores/user-info";
import { BellRingingIcon } from "phosphor-react-native";
import { Text, TouchableOpacity, View } from "react-native";

const BellIcon = withIconClassName(BellRingingIcon);

export const HomeHeader = () => {
  const { userInfo } = useUserInfoStore();
  return (
    <View className="flex-row items-center justify-between py-4">
      <View className="flex-row items-center gap-4">
        <Avatar source={{ uri: "https://avatar.iran.liara.run/public/32" }} />
        <View>
          <Text className="text-text-secondary">Welcome back!</Text>
          <Text className="font-semibold">
            {userInfo?.firstName} {userInfo?.lastName}
          </Text>
        </View>
      </View>
      <TouchableOpacity className="bg-white p-2 rounded-full">
        <BellIcon />
      </TouchableOpacity>
    </View>
  );
};
