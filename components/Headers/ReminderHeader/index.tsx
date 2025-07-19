import { Text, TouchableOpacity, View } from "react-native";

import { withIconClassName } from "@/hocs/withIconClassName";
import { PlusCircleIcon } from "phosphor-react-native";
const PlusIcon = withIconClassName(PlusCircleIcon);

interface IProps {
  onAddReminder: () => void;
}

export const ReminderHeader = ({ onAddReminder }: IProps) => {
  return (
    <View className="flex-row items-center justify-between p-4">
      <Text className="text-2xl font-bold">Reminders</Text>
      <TouchableOpacity
        className="bg-white p-2 rounded-full"
        onPress={onAddReminder}
      >
        <PlusIcon size={24} />
      </TouchableOpacity>
    </View>
  );
};
