import { PET_KEY } from "@/constants/query-keys";
import { IPet } from "@/interfaces";
import { getListPetQuery } from "@/services";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { FlatList } from "react-native";
import { PetProfileCard } from "../PetProfileCard";
import { Skeleton } from "../Skeleton";

export const PetInfoCardList = () => {
  const { data, isLoading } = useQuery({
    queryKey: PET_KEY.list(),
    queryFn: getListPetQuery,
  });
  const listPet = data?.data || [];

  const renderItem = ({ item }: { item: IPet }) => {
    return <PetProfileCard data={item} />;
  };
  if (isLoading) {
    return <Skeleton className="h-[355px] rounded-2xl" />;
  }

  return (
    <FlatList
      horizontal
      data={listPet}
      snapToAlignment="center"
      snapToInterval={SCREEN_WIDTH - 28}
      decelerationRate="fast"
      contentContainerClassName="gap-4"
      renderItem={renderItem}
    />
  );
};
