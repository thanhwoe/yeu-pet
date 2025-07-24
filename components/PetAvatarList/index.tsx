import { IPetInfoForm } from "@/constants/validation";
import { withIconClassName } from "@/hocs/withIconClassName";
import { createPetMutation } from "@/services";
import { useMutation } from "@tanstack/react-query";
import { PlusIcon as Plus } from "phosphor-react-native";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { PetInfoForm } from "../PetInfoForm";
import { Avatar } from "../ui/Avatar";
import { BottomSheet } from "../ui/BottomSheet";
const PlusIcon = withIconClassName(Plus);

const colors = [
  "border-red-200",
  "border-green-200",
  "border-blue-200",
  "border-pink-200",
  "border-gray-200",
];

export const PetAvatarList = () => {
  const [showForm, setShowForm] = useState(false);

  const { mutate } = useMutation({
    mutationFn: createPetMutation,
    onError: () => {},
    onSuccess: (res) => {
      setShowForm(false);
    },
  });

  const handleSubmit = async (data: IPetInfoForm) => {
    mutate(data);
  };

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 py-2"
      >
        {colors.map((color, index) => (
          <View key={index} className="items-center gap-2">
            <Avatar
              source={{ uri: "https://avatar.iran.liara.run/public/32" }}
              className={color}
              variant="line"
              size="large"
            />
            <Text>name</Text>
          </View>
        ))}
        <View className="items-center gap-2">
          <TouchableOpacity
            className="rounded-full overflow-hidden  p-1 border-2 border-orange-400"
            onPress={() => setShowForm(true)}
          >
            <View className="size-14 rounded-full bg-orange-200 items-center justify-center">
              <PlusIcon weight="bold" className="text-orange-400" />
            </View>
          </TouchableOpacity>
          <Text>Add</Text>
        </View>
      </ScrollView>
      <BottomSheet visible={showForm} onDismiss={() => setShowForm(false)}>
        <PetInfoForm onSubmit={handleSubmit} />
      </BottomSheet>
    </>
  );
};
