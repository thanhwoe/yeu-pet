import { PET_KEY } from "@/constants/query-keys";
import { IPetInfoForm } from "@/constants/validation";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IPet } from "@/interfaces";
import {
  createPetMutation,
  deletePetMutation,
  getListPetQuery,
  updatePetMutation,
} from "@/services";
import { cn } from "@/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon as Plus } from "phosphor-react-native";
import { useState } from "react";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";
import { PetInfoForm } from "../PetInfoForm";
import { Skeleton } from "../Skeleton";
import { Avatar } from "../ui/Avatar";
import { BottomSheet } from "../ui/BottomSheet";
import { Spinner } from "../ui/Spinner";
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

export const PetAvatarList = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedPet, setSelectedPet] = useState<IPet | null>();

  const queryClient = useQueryClient();

  const { mutate: createPet } = useMutation({
    mutationFn: createPetMutation,
    onError: () => {},
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: PET_KEY.list() });
      setShowForm(false);
    },
  });

  const { mutate: updatePet } = useMutation({
    mutationFn: updatePetMutation,

    onError: () => {},
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: PET_KEY.list() });
      setSelectedPet(null);
      setShowForm(false);
    },
  });

  const { mutate: deletePet, isPending: isDeleting } = useMutation({
    mutationFn: deletePetMutation,

    onError: () => {},
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: PET_KEY.list() });
      setSelectedPet(null);
      setShowForm(false);
    },
  });
  const { data, isLoading } = useQuery({
    queryKey: PET_KEY.list(),
    queryFn: getListPetQuery,
  });

  const handleSubmit = async (data: IPetInfoForm) => {
    if (selectedPet) {
      updatePet({
        pet_id: selectedPet.pet_id,
        ...data,
      });
    } else {
      createPet(data);
    }
  };

  const handleDeletePet = () => {
    Alert.alert("Remove Pet", "Are you sure you want to remove this pet?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        onPress: () => {
          selectedPet && deletePet(selectedPet.pet_id);
        },
        style: "destructive",
      },
    ]);
  };

  const defaultValue = selectedPet
    ? {
        ...selectedPet,
        age: selectedPet?.age.toString(),
      }
    : undefined;

  const handleShowUpdateForm = () => {
    setShowForm(true);
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
          <View key={index} className="items-center gap-2">
            <Avatar
              source={{
                uri:
                  pet.avatar_url || "https://avatar.iran.liara.run/public/32",
              }}
              className={colors[index]}
              variant="line"
              size="large"
              onPress={() => setSelectedPet(pet)}
            />
            <Text variant="footnote">{pet.name}</Text>
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
        <PetInfoForm onSubmit={handleSubmit} defaultValues={defaultValue} />
      </BottomSheet>

      <BottomSheet
        visible={Boolean(selectedPet)}
        onDismiss={() => setSelectedPet(null)}
        stackBehavior="push"
      >
        <View className="px-4 gap-3">
          <TouchableOpacity
            onPress={handleShowUpdateForm}
            className="px-4 py-4 items-center border border-orange-300 rounded-md"
          >
            <Text className="font-medium">Update Information</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDeletePet}
            className={cn(
              "px-4 py-4 flex-row items-center justify-center gap-2 border border-orange-300 rounded-md"
            )}
          >
            <Text className="text-red-600 font-medium">Remove Pet</Text>
          </TouchableOpacity>
        </View>
        {isDeleting && (
          <View className="absolute inset-0 items-center justify-center bg-white opacity-50">
            <Spinner />
          </View>
        )}
      </BottomSheet>
    </>
  );
};
