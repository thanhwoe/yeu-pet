import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { PetCardSection } from "./PetCardSection";
import { ReminderSection } from "./ReminderSection";

export const HomeScreen = () => {
  return (
    <ScreenContainer scrollEnabled>
      <PetCardSection />
      <ReminderSection />
    </ScreenContainer>
  );
};
