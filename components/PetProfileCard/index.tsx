import { cn } from "@/utils";
import { Text, View } from "react-native";
import { Avatar } from "../ui/Avatar";

export const PetProfileCard = () => {
  const infos = [
    {
      label: "Gender",
      value: "Female",
    },
    {
      label: "Age",
      value: "6 years",
    },
    {
      label: "Birthdate",
      value: "1/1/2000",
    },
    {
      label: "Breed",
      value: "Cocker",
    },
    {
      label: "Weight",
      value: "6 kg",
    },
  ];

  return (
    <View className="gap-4">
      <View className="flex-row bg-slate-100 rounded-2xl p-4 items-center gap-4">
        <Avatar
          source={{ uri: "https://avatar.iran.liara.run/public/32" }}
          className="p-1 bg-white"
        />
        <View>
          <Text className="font-bold">Name</Text>
          <Text>Dog</Text>
        </View>
      </View>
      <View className="flex-row flex-wrap">
        {infos.map((i, index) => (
          <View
            className={cn("justify-between items-start gap-2 mb-4", {
              "basis-2/3": index % 2 === 0,
            })}
            key={i.label + index}
          >
            <Text className="font-semibold text-gray-400">{i.label}</Text>
            <Text className="font-semibold">{i.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
