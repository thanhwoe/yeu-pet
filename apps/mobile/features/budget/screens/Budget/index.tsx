import { MonthYear, MonthYearPicker } from "@/components/MonthYearPicker";
import {
  CURRENT_MONTH,
  CURRENT_YEAR,
} from "@/components/MonthYearPicker/utils";
import { Tabs } from "@/components/Tabs";
import { Toast } from "@/components/Toast";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Options } from "@/components/ui/Options";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Body, Heading } from "@/components/ui/Typography";
import {
  BUDGET_CATEGORY_KEY,
  BUDGET_KEY,
  BUDGET_STATISTIC_KEY,
  BUDGET_TRANSACTION_KEY,
  SUBSCRIPTION_KEY,
} from "@/constants/query-keys";
import {
  IBudgetCategoryForm,
  IBudgetTransactionForm,
} from "@/constants/validation";
import { BudgetCategoryForm } from "@/features/budget/components/BudgetCategoryForm";
import { BudgetTransaction } from "@/features/budget/components/BudgetTransaction";
import { BudgetTransactionForm } from "@/features/budget/components/BudgetTransactionForm";
import { withIconClassName } from "@/hocs/withIconClassName";
import { SubscriptionEntitlements } from "@/interfaces";
import {
  createBudgetCategoryMutation,
  createBudgetTransactionMutation,
  getBudgetCategoryQuery,
  getBudgetMonthlyStatisticsQuery,
  getBudgetQuery,
  getBudgetTransactionQuery,
  getBudgetYearlyStatisticsQuery,
  updateBudgetMutation,
} from "@/services";
import { groupBudgetTransactions } from "@/utils/budget";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Link, useNavigation } from "expo-router";
import { CalendarBlankIcon, PlusIcon } from "phosphor-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { BudgetInput } from "./BudgetSection/BudgetInput";
import { BudgetTabContent, TABS, TabValue } from "./BudgetTabContent";

const AddIcon = withIconClassName(PlusIcon);
const CalendarIcon = withIconClassName(CalendarBlankIcon);

type AddOptionAction = "budget" | "category" | "transaction";

export function BudgetScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>(TABS[0].value);
  const [monthYear, setMonthYear] = useState<MonthYear>({
    month: CURRENT_MONTH,
    year: CURRENT_YEAR,
  });

  const months = useRef(dayjs.monthsShort()).current;

  const [openAddOptions, setOpenAddOptions] = useState(false);
  const [openCategoryForm, setOpenCategoryForm] = useState(false);
  const [openTransactionForm, setOpenTransactionForm] = useState(false);
  const [openBudgetForm, setOpenBudgetForm] = useState(false);
  const [pendingAddAction, setPendingAddAction] = useState<AddOptionAction>();

  const actualMonth = monthYear.month + 1;

  const { data: categories } = useQuery({
    queryKey: BUDGET_CATEGORY_KEY.list({ limit: 20 }),
    queryFn: () => getBudgetCategoryQuery({ limit: 20 }),
  });

  const { data: budgetData, isLoading: isLoadingBudget } = useQuery({
    queryKey: BUDGET_KEY.detail(`${actualMonth} ${monthYear.year}`),
    queryFn: () => getBudgetQuery({ month: actualMonth, year: monthYear.year }),
  });

  const {
    data: transactions,
    isError: isTransactionError,
    isLoading: isLoadingTransaction,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: BUDGET_TRANSACTION_KEY.list({
      limit: 5,
      month: actualMonth,
      year: monthYear.year,
    }),
    queryFn: () =>
      getBudgetTransactionQuery({
        limit: 5,
        month: actualMonth,
        year: monthYear.year,
      }),
  });

  const { data: statisticYearly, isLoading: isLoadingStatisticYearly } =
    useQuery({
      queryKey: BUDGET_STATISTIC_KEY.detail(`yearly ${monthYear.year}`),
      queryFn: () => getBudgetYearlyStatisticsQuery({ year: monthYear.year }),
    });
  const { data: statisticMonthly, isLoading: isLoadingStatisticMonthly } =
    useQuery({
      queryKey: BUDGET_STATISTIC_KEY.detail(
        `monthly ${actualMonth} ${monthYear.year}`,
      ),
      queryFn: () =>
        getBudgetMonthlyStatisticsQuery({
          month: actualMonth,
          year: monthYear.year,
        }),
    });

  const sections = useMemo(
    () => groupBudgetTransactions(transactions?.data ?? []),
    [transactions?.data],
  );

  const { mutateAsync: createCategory, isPending: isCategoryCreating } =
    useMutation({
      mutationFn: createBudgetCategoryMutation,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: BUDGET_CATEGORY_KEY.lists(),
        });
        setOpenAddOptions(false);
        setOpenCategoryForm(false);
      },
      onError: (e) => {
        Toast.error({
          title: "Category not created",
          text: e.message || "Check the category details and try again.",
        });
      },
    });

  const handleSubmitCategory = async (data: IBudgetCategoryForm) => {
    createCategory(data);
  };

  const { mutateAsync: createTransaction, isPending: isTransactionCreating } =
    useMutation({
      mutationFn: createBudgetTransactionMutation,
      onSuccess: (_transaction, variables) => {
        queryClient.invalidateQueries({
          queryKey: BUDGET_TRANSACTION_KEY.lists(),
        });
        queryClient.invalidateQueries({ queryKey: BUDGET_KEY.details() });
        queryClient.invalidateQueries({
          queryKey: BUDGET_STATISTIC_KEY.details(),
        });
        if (dayjs(variables.date).isSame(dayjs(), "month")) {
          queryClient.setQueryData(
            SUBSCRIPTION_KEY.entitlements(),
            (old: SubscriptionEntitlements | undefined) =>
              old
                ? {
                    ...old,
                    usage: {
                      ...old.usage,
                      budgetTransactionsThisMonth:
                        old.usage.budgetTransactionsThisMonth + 1,
                    },
                  }
                : old,
          );
        }
        setOpenAddOptions(false);
        setOpenTransactionForm(false);
      },
      onError: (e) => {
        Toast.error({
          title: "Transaction not added",
          text: e.message || "Check the transaction details and try again.",
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: BUDGET_TRANSACTION_KEY.lists(),
        });
        queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEY.all });
      },
    });

  const handleSubmitTransaction = async (data: IBudgetTransactionForm) => {
    createTransaction(data);
  };

  const { mutateAsync: updateBudget, isPending: isUpdatingBudget } =
    useMutation({
      mutationFn: updateBudgetMutation,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: BUDGET_KEY.details() });
        setOpenBudgetForm(false);
        setOpenAddOptions(false);
      },
      onError: (e) => {
        Toast.error({
          title: "Budget not updated",
          text: e.message || "Check the amount and try again.",
        });
      },
    });

  const handleAddOptionPress = useCallback((action: AddOptionAction) => {
    setPendingAddAction(action);
    setOpenAddOptions(false);
  }, []);

  useEffect(() => {
    if (openAddOptions || !pendingAddAction) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      if (pendingAddAction === "budget") {
        setOpenBudgetForm(true);
      }

      if (pendingAddAction === "category") {
        setOpenCategoryForm(true);
      }

      if (pendingAddAction === "transaction") {
        setOpenTransactionForm(true);
      }

      setPendingAddAction(undefined);
    });

    return () => cancelAnimationFrame(frame);
  }, [openAddOptions, pendingAddAction]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          className="bg-background-secondary-pressed p-8 rounded-8"
          accessibilityLabel="Open budget actions"
          accessibilityRole="button"
          onPress={() => setOpenAddOptions(true)}
        >
          <AddIcon className="text-icon-primary" weight="bold" />
        </TouchableOpacity>
      ),
    });
  }, []);

  const ListHeaderComponent = useMemo(() => {
    return (
      <View className="flex-row items-center justify-between pt-4">
        <Heading variant="h5" weight="bold">
          Recent Transactions
        </Heading>
        {sections.length > 0 && (
          <Link href="/budget/transactions">
            <Body className="text-text-link">See all</Body>
          </Link>
        )}
      </View>
    );
  }, [sections]);
  return (
    <ScreenContainer
      scrollEnabled
      contentContainerClassName="px-16 pb-safe-or-2 gap-20"
    >
      <View className="flex-row bg-background-card-highlight justify-between p-8 rounded-24">
        <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
        <TouchableOpacity
          className="flex-row items-center gap-8 pr-8"
          accessibilityLabel="Select budget period"
          accessibilityRole="button"
          onPress={() => setOpenDatePicker(true)}
        >
          <Body weight="bold">
            {months[monthYear.month]} {monthYear.year}
          </Body>
          <CalendarIcon weight="bold" className="text-icon-primary" />
        </TouchableOpacity>
      </View>

      <BudgetTabContent
        active={activeTab}
        month={{
          budgetData: budgetData,
          loadingBudget: isLoadingBudget,
          chartData: statisticMonthly?.dailyTrend || [],
          loading: isLoadingStatisticMonthly,
          categoryData: statisticMonthly?.spendingByCategory ?? [],
        }}
        year={{
          chartData: statisticYearly?.monthlyTrend || [],
          loading: isLoadingStatisticYearly,
          summary: statisticYearly?.summary,
          categoryData: statisticYearly?.spendingByCategory ?? [],
        }}
      />

      <BudgetTransaction
        sections={sections}
        scrollEnabled={false}
        ListHeaderComponent={ListHeaderComponent}
        loading={isLoadingTransaction}
        error={isTransactionError}
        onRetry={() => refetchTransactions()}
        onAdd={() => {
          if (categories?.data.length) {
            setOpenTransactionForm(true);
            return;
          }

          setOpenCategoryForm(true);
        }}
        compactEmpty
        emptyTitle="No recent transactions"
        emptyDescription="Add a pet-care expense when you are ready to track this period."
      />
      <BottomSheet
        useScrollView={false}
        visible={openDatePicker}
        titleElement={<Body weight="semiBold">Select period</Body>}
        onDismiss={() => setOpenDatePicker(false)}
      >
        <MonthYearPicker
          onConfirm={(v) => {
            setMonthYear(v);
            setOpenDatePicker(false);
          }}
          initialMonth={monthYear.month}
          initialYear={monthYear.year}
        />
      </BottomSheet>

      <BottomSheet
        visible={openAddOptions}
        onDismiss={() => setOpenAddOptions(false)}
      >
        <Options
          data={[
            {
              label: "Set monthly budget",
              value: "budget",
              onPress: () => handleAddOptionPress("budget"),
            },
            {
              label: "Add new category",
              value: "category",
              onPress: () => handleAddOptionPress("category"),
            },
            {
              label: "Add new transaction",
              disabled: !Boolean(categories?.data.length),
              value: "transaction",
              onPress: () => handleAddOptionPress("transaction"),
            },
          ]}
        />
      </BottomSheet>
      <BottomSheet
        visible={openTransactionForm}
        onDismiss={() => setOpenTransactionForm(false)}
      >
        <BudgetTransactionForm
          onSubmit={handleSubmitTransaction}
          submitting={isTransactionCreating}
          categories={categories?.data ?? []}
        />
      </BottomSheet>
      <BottomSheet
        visible={openCategoryForm}
        onDismiss={() => setOpenCategoryForm(false)}
        keyboardBehavior="interactive"
      >
        <BudgetCategoryForm
          onSubmit={handleSubmitCategory}
          submitting={isCategoryCreating}
        />
      </BottomSheet>

      <BottomSheet
        visible={openBudgetForm}
        onDismiss={() => setOpenBudgetForm(false)}
        titleElement={<Body weight="semiBold">Set monthly budget</Body>}
        useScrollView
        keyboardBehavior="interactive"
      >
        <BudgetInput
          onSubmit={(v) => {
            updateBudget({
              amount: v,
              month: actualMonth,
              year: monthYear.year,
            });
          }}
          isLoading={isUpdatingBudget}
          defaultValue={budgetData?.amount}
        />
      </BottomSheet>
    </ScreenContainer>
  );
}
