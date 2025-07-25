import { IPet } from "@/interfaces";
import { date } from "@/utils";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Avatar } from "../ui/Avatar";
import { BottomSheet } from "../ui/BottomSheet";
import { Text } from "../ui/Text";

export const PetProfileCard = ({ data }: { data: IPet }) => {
  const [showNotes, setShowNotes] = useState(false);

  const infos = [
    {
      label: "Gender",
      value: data.gender,
    },
    {
      label: "Age",
      value: typeof data.age === "number" ? `${data.age} years` : "N/A",
    },
    {
      label: "Birthdate",
      value: data.birthdate ? date(data.birthdate).format("DD/MM/YYYY") : "N/A",
    },
    {
      label: "Breed",
      value: data.breed,
    },
    {
      label: "Weight",
      value: data.weight,
    },
    {
      label: "Color",
      value: data.color,
    },
  ];

  return (
    <View
      className="gap-4 bg-white rounded-2xl p-6 pb-0 shadow-sm"
      style={{
        width: SCREEN_WIDTH - 40,
      }}
    >
      <View className="flex-row bg-slate-100 rounded-2xl p-4 items-center gap-4">
        <Avatar
          source={{
            uri: data.avatar_url || "https://avatar.iran.liara.run/public/32",
          }}
          className="p-1 bg-white"
        />
        <View>
          <Text className="font-bold">{data.name}</Text>
          <Text className="capitalize">{data.species}</Text>
        </View>
      </View>
      <View className="flex-row flex-wrap">
        {infos.map((i, index) => (
          <View
            className="w-1/2 justify-between items-start gap-1 mb-2 pr-2"
            key={i.label + index}
          >
            <Text variant="body2" className="font-semibold text-gray-400">
              {i.label}
            </Text>
            <Text variant="body2" className="capitalize font-semibold">
              {i.value || "N/A"}
            </Text>
          </View>
        ))}
      </View>
      {data.notes && (
        <>
          <TouchableOpacity
            onPress={() => setShowNotes(true)}
            className="mb-2 self-end"
          >
            <Text variant="subhead" className="text-blue-500">
              Notes
            </Text>
          </TouchableOpacity>
          <BottomSheet
            visible={showNotes}
            onDismiss={() => setShowNotes(false)}
          >
            <View className="p-4">
              <Text>{data.notes}</Text>
            </View>
          </BottomSheet>
        </>
      )}
    </View>
  );
};
