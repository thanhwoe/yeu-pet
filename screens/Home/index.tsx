import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { PetCardSection } from "./PetCardSection";

export const HomeScreen = () => {
  return (
    <ScreenContainer scrollEnabled>
      <PetCardSection />
    </ScreenContainer>
  );
};
