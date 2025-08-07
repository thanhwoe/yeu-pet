import { HomeHeader } from "@/components/Headers/HomeHeader";
import { PetAvatarList } from "@/components/PetAvatarList";
import { PetClinicList } from "@/components/PetClinicList";
import { PetInfoCardList } from "@/components/PetInfoCardList";
import { PetTimeline } from "@/components/PetTimeline";
import { Tabs } from "@/components/Tabs";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { PET_KEY } from "@/constants/query-keys";
import { IPet } from "@/interfaces";
import { getListPetQuery } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function HomeScreen() {
  const [selectedPet, setSelectedPet] = useState<IPet | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: PET_KEY.list(),
    queryFn: getListPetQuery,
  });

  const tabs = [
    {
      title: "Profile",
      content: () => (
        <PetInfoCardList
          selectedPet={selectedPet}
          data={data?.data || []}
          isLoading={isLoading}
        />
      ),
    },
    {
      title: "Timeline",
      content: () => (
        <PetTimeline
          selectedPet={selectedPet}
          data={data?.data || []}
          isLoading={isLoading}
        />
      ),
    },
  ];

  return (
    <ScreenContainer>
      <HomeHeader />
      <PetAvatarList onSelectPet={setSelectedPet} />
      <Tabs tabs={tabs} />
      <PetClinicList />
    </ScreenContainer>
  );
}
