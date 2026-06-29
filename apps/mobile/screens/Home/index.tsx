import { RefreshControl } from "@/components/RefreshControl";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import {
  BUDGET_STATISTIC_KEY,
  PET_KEY,
  REMINDER_KEY,
} from "@/constants/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { BudgetStatisticSection } from "./BudgetStatisticSection";
import { HOME_BUDGET_MONTHLY_KEY } from "./homeQueries";
import { PetCardSection } from "./PetCardSection";
import { ReminderSection } from "./ReminderSection";

export const HomeScreen = () => {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const refreshHome = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: PET_KEY.list() }),
        queryClient.refetchQueries({
          queryKey: REMINDER_KEY.all,
        }),
        queryClient.refetchQueries({
          queryKey: BUDGET_STATISTIC_KEY.detail(HOME_BUDGET_MONTHLY_KEY),
        }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  return (
    <ScreenContainer
      scrollEnabled
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshHome}
          colorClassName="text-text-primary"
        />
      }
    >
      <PetCardSection />
      <ReminderSection />
      <BudgetStatisticSection />
    </ScreenContainer>
  );
};
