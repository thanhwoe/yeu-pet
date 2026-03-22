import { Avatar } from "@/components/ui/Avatar";
import { Heading } from "@/components/ui/Typography";
import { withIconClassName } from "@/hocs/withIconClassName";
import { useUserInfoStore } from "@/stores/user-info";
import { BellRingingIcon } from "phosphor-react-native";
import { TouchableOpacity, View } from "react-native";

const BellIcon = withIconClassName(BellRingingIcon);

export const HomeHeader = () => {
  const { user } = useUserInfoStore();
  return (
    <View className="gap-8 pt-safe bg-background px-20">
      <View className="flex-row justify-between items-center">
        <Heading variant="h4" weight="bold" className="text-text-secondary">
          🐾 YeuPet
        </Heading>
        <View className="flex-row gap-16 items-center">
          <TouchableOpacity className="bg-background-tertiary p-8 rounded-full">
            <BellIcon className="text-icon-primary" size={26} />
          </TouchableOpacity>
          <Avatar
            variant="line"
            source={{
              uri: user?.avatarUrl ?? undefined,
            }}
          />
        </View>
      </View>

      <View>
        <Heading variant="h4">Hi, {user?.firstName}</Heading>
        <Heading variant="h6">Good morning!</Heading>
      </View>
    </View>
  );
};
