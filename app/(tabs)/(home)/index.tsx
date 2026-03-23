import { PetCardCarousel } from "@/components/PetCardCarousel";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

export default function HomeScreen() {
  return (
    <ScreenContainer scrollEnabled>
      <PetCardCarousel />

      {/* 
      <PetCardCarousel />
      <PetAvatarList onSelectPet={setSelectedPet} />
      <Tabs tabs={tabs} className="py-8" />
      <PetClinicList /> */}
    </ScreenContainer>
  );
}
