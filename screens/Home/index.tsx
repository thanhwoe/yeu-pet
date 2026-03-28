import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { BudgetStatisticSection } from "./BudgetStatisticSection";
import { PetCardSection } from "./PetCardSection";
import { ReminderSection } from "./ReminderSection";

export const HomeScreen = () => {
  return (
    <ScreenContainer scrollEnabled>
      <PetCardSection />
      <ReminderSection />
      <BudgetStatisticSection />
    </ScreenContainer>
  );
};
