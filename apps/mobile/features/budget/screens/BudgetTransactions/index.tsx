import { Popup } from "@/components/Popup";
import { Toast } from "@/components/Toast";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Spinner } from "@/components/ui/Spinner";
import {
  BUDGET_CATEGORY_KEY,
  BUDGET_KEY,
  BUDGET_STATISTIC_KEY,
  BUDGET_TRANSACTION_KEY,
  SUBSCRIPTION_KEY,
} from "@/constants/query-keys";
import { IBudgetTransactionForm } from "@/constants/validation";
import { BudgetTransaction } from "@/features/budget/components/BudgetTransaction";
import { BudgetTransactionForm } from "@/features/budget/components/BudgetTransactionForm";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IBudgetTransaction, SubscriptionEntitlements } from "@/interfaces";
import {
  createBudgetTransactionMutation,
  deleteBudgetTransactionMutation,
  getBudgetCategoryQuery,
  getBudgetTransactionQuery,
  updateBudgetTransactionMutation,
} from "@/services";
import { groupBudgetTransactions } from "@/utils/budget";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import dayjs from "dayjs";
import { useNavigation } from "expo-router";
import { PlusIcon } from "phosphor-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TouchableOpacity } from "react-native";

const AddIcon = withIconClassName(PlusIcon);

export const BudgetTransactionsScreen = () => {
  const [transactionEdit, setTransactionEdit] = useState<IBudgetTransaction>();
  const [transactionDelete, setTransactionDelete] =
    useState<IBudgetTransaction>();
  const [openTransactionForm, setOpenTransactionForm] = useState(false);

  const navigation = useNavigation();
  const queryClient = useQueryClient();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          className="bg-background-secondary-pressed p-8 rounded-8"
          accessibilityLabel="Add budget transaction"
          accessibilityRole="button"
          onPress={() => setOpenTransactionForm(true)}
        >
          <AddIcon className="text-icon-primary" weight="bold" />
        </TouchableOpacity>
      ),
    });
  }, []);

  const { data: categories } = useQuery({
    queryKey: BUDGET_CATEGORY_KEY.list({ limit: 20 }),
    queryFn: () => getBudgetCategoryQuery({ limit: 20 }),
  });

  const {
    data: transactions,
    isLoading,
    isError,
    isFetchingNextPage,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: BUDGET_TRANSACTION_KEY.list({
      limit: 10,
    }),
    queryFn: ({ pageParam }) =>
      getBudgetTransactionQuery({
        limit: 10,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta.hasNextPage) return undefined;
      return lastPage.meta.page + 1;
    },
    select: (data) => data?.pages.flatMap((item) => item.data) || [],
  });

  const sections = useMemo(
    () => groupBudgetTransactions(transactions ?? []),
    [transactions],
  );

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
        setOpenTransactionForm(false);
      },
      onError: (e) => {
        Toast.error({ text: e.message });
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: BUDGET_TRANSACTION_KEY.lists(),
        });
        queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEY.all });
      },
    });

  const { mutateAsync: updateTransaction, isPending: isTransactionUpdating } =
    useMutation({
      mutationFn: updateBudgetTransactionMutation,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: BUDGET_TRANSACTION_KEY.lists(),
        });
        queryClient.invalidateQueries({ queryKey: BUDGET_KEY.details() });
        queryClient.invalidateQueries({
          queryKey: BUDGET_STATISTIC_KEY.details(),
        });
        setOpenTransactionForm(false);
        setTransactionEdit(undefined);
      },
      onError: (e) => {
        Toast.error({ text: e.message });
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEY.all });
      },
    });

  const handleSubmitTransaction = async (data: IBudgetTransactionForm) => {
    if (transactionEdit) {
      updateTransaction({ ...data, id: transactionEdit.id });
    } else {
      createTransaction(data);
    }
  };

  const { mutateAsync: deleteTransaction, isPending: isTransactionDeleting } =
    useMutation({
      mutationFn: deleteBudgetTransactionMutation,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: BUDGET_TRANSACTION_KEY.lists(),
        });
        queryClient.invalidateQueries({ queryKey: BUDGET_KEY.details() });
        queryClient.invalidateQueries({
          queryKey: BUDGET_STATISTIC_KEY.details(),
        });
      },
      onError: (e) => {
        Toast.error({ text: e.message });
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEY.all });
        setOpenTransactionForm(false);
        setTransactionDelete(undefined);
      },
    });

  const handleCancel = useCallback(() => setTransactionDelete(undefined), []);

  const handleDelete = useCallback(() => {
    if (transactionDelete) {
      deleteTransaction(transactionDelete.id);
    }
  }, [transactionDelete, deleteTransaction]);

  return (
    <ScreenContainer>
      <BudgetTransaction
        sections={sections}
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        onAdd={() => setOpenTransactionForm(true)}
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={refetch}
        contentContainerClassName="pb-safe"
        className="mt-20"
        onEndReached={() => {
          if (isLoading || isFetchingNextPage || !hasNextPage) return;
          if (!transactions?.length) return;
          fetchNextPage();
        }}
        onEndReachedThreshold={0.2}
        onEdit={setTransactionEdit}
        onDelete={setTransactionDelete}
        editing={isTransactionUpdating}
        deleting={isTransactionDeleting}
        ListFooterComponent={isFetchingNextPage ? <Spinner /> : null}
      />

      <BottomSheet
        visible={openTransactionForm || !!transactionEdit}
        onDismiss={() => {
          setOpenTransactionForm(false);
          setTransactionEdit(undefined);
        }}
      >
        <BudgetTransactionForm
          onSubmit={handleSubmitTransaction}
          submitting={isTransactionCreating || isTransactionUpdating}
          categories={categories?.data ?? []}
          {...(transactionEdit && {
            defaultValues: {
              amount: transactionEdit.amount,
              categoryId: transactionEdit.categoryId,
              date: dayjs(transactionEdit.date).toDate(),
              description: transactionEdit.description,
              petId: transactionEdit.petId ?? undefined,
            },
          })}
        />
      </BottomSheet>

      <Popup
        visible={!!transactionDelete}
        onCancel={handleCancel}
        onConfirm={handleDelete}
        title="Remove Transaction"
        description="Are you sure you want to remove this transaction?"
        variant="delete"
        loading={isTransactionDeleting}
      />
    </ScreenContainer>
  );
};
