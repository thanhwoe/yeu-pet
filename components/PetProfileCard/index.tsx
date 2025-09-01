import { PET_KEY } from "@/constants/query-keys";
import { IPetInfoForm } from "@/constants/validation";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IPet } from "@/interfaces";
import { deletePetMutation, updatePetMutation } from "@/services";
import { cn, date } from "@/utils";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DotsThreeOutlineIcon } from "phosphor-react-native";
import { useState } from "react";
import { Alert, TouchableOpacity, View } from "react-native";
import { PetInfoForm } from "../PetInfoForm";
import { Avatar } from "../ui/Avatar";
import { BottomSheet } from "../ui/BottomSheet";
import { Spinner } from "../ui/Spinner";
import { Text } from "../ui/Text";

const DotsThree = withIconClassName(DotsThreeOutlineIcon);

export const PetProfileCard = ({ data }: { data: IPet }) => {
  const [showNotes, setShowNotes] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

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

  const queryClient = useQueryClient();

  const { mutate: updatePet } = useMutation({
    mutationFn: updatePetMutation,
    onError: () => { },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: PET_KEY.list() });
      setShowMenu(false);
      setShowForm(false);
    },
  });

  const { mutate: deletePet, isPending: isDeleting } = useMutation({
    mutationFn: deletePetMutation,
    onError: () => { },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: PET_KEY.list() });
      setShowMenu(false);
      setShowForm(false);
    },
  });

  const handleSubmit = async (payload: IPetInfoForm) => {
    updatePet({
      pet_id: data.pet_id,
      ...payload,
    });
  };

  const handleDeletePet = () => {
    Alert.alert("Remove Pet", "Are you sure you want to remove this pet?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        onPress: () => {
          deletePet(data.pet_id);
        },
        style: "destructive",
      },
    ]);
  };

  const defaultValue = {
    ...data,
    age: data?.age.toString(),
  };

  return (
    <>
      <View
        className="gap-4 bg-white rounded-2xl p-6 pb-0 shadow-sm"
        style={{
          width: SCREEN_WIDTH - 40,
        }}
      >
        <TouchableOpacity
          hitSlop={10}
          onPress={setShowMenu.bind(this, true)}
          className="absolute top-3 right-3"
        >
          <DotsThree size={22} weight="fill" className="text-text-primary" />
        </TouchableOpacity>
        <View className="flex-row bg-background-card-info rounded-2xl rounded-tr-[50px] p-4 items-center gap-4">
          <Avatar
            source={{
              uri: data.avatar_url || "https://avatar.iran.liara.run/public/32",
            }}
            className="p-1 bg-white"
          />
          <View className="flex-1">
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
              <Text variant="body2" className="capitalize">
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
              <Text variant="subhead" className="text-text-link">
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
      <BottomSheet
        stackBehavior="push"
        titleElement={<Text className="font-medium">
          Update Pet Information
        </Text>}
        visible={showForm}
        onDismiss={() => setShowForm(false)}
      >
        <PetInfoForm onSubmit={handleSubmit} defaultValues={defaultValue} />
      </BottomSheet>

      <BottomSheet
        visible={showMenu}
        onDismiss={() => setShowMenu(false)}
        stackBehavior="push"
      >
        <View className="px-4 gap-3">
          <TouchableOpacity
            onPress={setShowForm.bind(this, true)}
            className="px-4 py-4 items-center border border-line-secondary rounded-md"
          >
            <Text className="font-medium">Update Information</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDeletePet}
            className={cn(
              "px-4 py-4 flex-row items-center justify-center gap-2 border border-line-secondary rounded-md"
            )}
          >
            <Text className="text-text-negative font-medium">Remove Pet</Text>
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
