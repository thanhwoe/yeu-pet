import { PET_KEY } from "@/constants/query-keys";
import { IPetInfoForm } from "@/constants/validation";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IPet } from "@/interfaces";
import { createPetMutation, getListPetQuery } from "@/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon as Plus } from "phosphor-react-native";
import { useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { PetInfoForm } from "../PetInfoForm";
import { Skeleton } from "../Skeleton";
import { Avatar } from "../ui/Avatar";
import { BottomSheet } from "../ui/BottomSheet";
import { Text } from "../ui/Text";
const PlusIcon = withIconClassName(Plus);

const colors = [
  "border-red-200",
  "border-green-200",
  "border-blue-200",
  "border-pink-200",
  "border-gray-200",

  // TODO: replace new colors
  "border-red-200",
  "border-green-200",
  "border-blue-200",
  "border-pink-200",
  "border-gray-200",
];

interface IProps {
  onSelectPet: (pet: IPet) => void;
}

export const PetAvatarList = ({ onSelectPet }: IProps) => {
  const [showForm, setShowForm] = useState(false);

  const queryClient = useQueryClient();

  const { mutate: createPet } = useMutation({
    mutationFn: createPetMutation,
    onError: () => {},
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: PET_KEY.list() });
      setShowForm(false);
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: PET_KEY.list(),
    queryFn: getListPetQuery,
  });

  const handleSubmit = async (data: IPetInfoForm) => {
    createPet(data);
  };

  const listPet = data?.data || [];

  if (isLoading) {
    return (
      <View className="flex-row gap-3 py-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton className="w-14 h-14 rounded-full" key={index} />
        ))}
      </View>
    );
  }

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 py-2"
      >
        {listPet.map((pet, index) => (
          <View key={index} className="items-center gap-2 flex-1 max-w-[68px]">
            <Avatar
              source={{
                uri:
                  pet.avatar_url || "https://avatar.iran.liara.run/public/32",
              }}
              className={colors[index]}
              variant="line"
              size="large"
              onPress={() => onSelectPet(pet)}
            />
            <Text variant="footnote" numberOfLines={1}>
              {pet.name}
            </Text>
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
          <Text variant="footnote">Add</Text>
        </View>
      </ScrollView>
      <BottomSheet
        stackBehavior="push"
        visible={showForm}
        onDismiss={() => setShowForm(false)}
      >
        <PetInfoForm onSubmit={handleSubmit} />
      </BottomSheet>
    </>
  );
};
