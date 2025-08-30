import { BudgetTransactionForm } from "@/components/BudgetTransactionForm";
import { BarChart, LineChart } from "@/components/chart";
import { Tabs } from "@/components/Tabs";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Text } from "@/components/ui/Text";
import { BUDGET_TRANSACTION_KEY } from "@/constants/query-keys";
import { IBudgetTransactionForm } from "@/constants/validation";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IBudgetTransaction } from "@/interfaces";
import {
  createBudgetTransactionMutation,
  deleteBudgetTransactionMutation,
  getListBudgetTransactionQuery,
  updateBudgetTransactionMutation,
} from "@/services/budget-transaction";
import { FlashList } from "@shopify/flash-list";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigation } from "expo-router";
import { reduce } from "lodash";
import {
  ClipboardTextIcon,
  PencilSimpleIcon,
  PlusCircleIcon,
} from "phosphor-react-native";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, TouchableOpacity, View } from "react-native";
import { TransactionItem } from "./TransactionItem";

const PlusIcon = withIconClassName(PlusCircleIcon);
const EditIcon = withIconClassName(PencilSimpleIcon);
const ClipboardIcon = withIconClassName(ClipboardTextIcon);

const LIMIT = 5;

export function BudgetScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [openTransactionForm, setOpenTransactionForm] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<IBudgetTransaction>();

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: BUDGET_TRANSACTION_KEY.list({ limit: LIMIT }),
      queryFn: ({ pageParam }) =>
        getListBudgetTransactionQuery({
          limit: LIMIT,
          page: pageParam,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        if (!lastPage.metadata.nextPage) return null;

        return lastPage.metadata.nextPage;
      },
      select: (data) => data?.pages.flatMap((item) => item.data) || [],
    });

  const renderFooter = () => {
    if (!hasNextPage) {
      return (
        <View className="mt-4 items-center">
          <Text className="text-text-secondary">No more items</Text>
        </View>
      );
    }

    return (
      <View className="mt-4 items-center">
        {isFetchingNextPage ? (
          <ActivityIndicator size="small" color="#666" />
        ) : (
          <Button variant="tonal" onPress={() => fetchNextPage()}>
            Tap to load more
          </Button>
        )}
      </View>
    );
  };

  const { sections, sectionIndices } = useMemo(
    () =>
      reduce(
        data ?? [],
        (acc, txn) => {
          const date = txn?.date.split("T")[0];

          if (date !== acc.currentSectionDate) {
            acc.sections.push(date);
            acc.sectionIndices.push(acc.sections.length);
            acc.currentSectionDate = date;
          }
          if (txn) {
            acc.sections.push(txn);
          }

          return acc;
        },
        {
          sections: [] as (string | IBudgetTransaction)[],
          sectionIndices: [] as number[],
          currentSectionDate: null as string | null,
        }
      ),
    [data]
  );

  const { mutate: createTransaction } = useMutation({
    mutationFn: createBudgetTransactionMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: BUDGET_TRANSACTION_KEY.lists(),
      });
      setOpenTransactionForm(false);
    },
  });

    const { mutate: updateTransaction } = useMutation({
    mutationFn: updateBudgetTransactionMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: BUDGET_TRANSACTION_KEY.lists(),
      });
      setOpenTransactionForm(false);
      setSelectedTransaction(undefined);
    },
  });

    const { mutate: deleteTransaction } = useMutation({
    mutationFn: deleteBudgetTransactionMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: BUDGET_TRANSACTION_KEY.lists(),
      });
    },
  });

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setOpenTransactionForm(true)}
          className="bg-background-white p-2 rounded-full"
        >
          <PlusIcon size={24} />
        </TouchableOpacity>
      ),
    });
  }, []);

  const tabs = [
    {
      title: "Month",
      content: () => <LineChart />,
    },
    {
      title: "Year",
      content: () => <BarChart />,
    },
  ];

  const handleCloseForm = () => {
    setOpenTransactionForm(false);
  };

  const handleCreateTransaction = async (data: IBudgetTransactionForm) => {
    if(selectedTransaction) {
      updateTransaction({...data, id: selectedTransaction.id});
    } else {
      createTransaction(data);
    }
  };

  const handleEditTransaction = (data: IBudgetTransaction) => {
    setSelectedTransaction(data);
    setOpenTransactionForm(true);
  };

  const handleDeleteTransaction = (data: IBudgetTransaction) => {
    Alert.alert(
      "Remove Transaction",
      "Are you sure you want to remove this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: () => {
            deleteTransaction(data.id);
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <ScreenContainer contentContainerClassName="pt-2 pb-safe-or-2">
      <View className="px-5">
        <View className="bg-background-card-info p-4 rounded-2xl gap-4">
          <View className="flex-row items-center gap-2">
            <ClipboardIcon size={18} weight="bold" />
            <Text className="font-bold">This month</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="font-medium">Spent balance</Text>
            <Text className="font-bold text-text-highlight-swarthy">$124</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="font-medium">Remaining balance</Text>
            <Text className="font-bold text-text-highlight-swarthy">$124</Text>
          </View>
          <View
            className="h-[1px] bg-background-primary w-full"
            style={{
              height: 1,
            }}
          />
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text className="font-medium">Monthly budget</Text>
              <EditIcon size={18} weight="bold" />
            </View>
            <Text className="font-bold text-text-highlight">$124</Text>
          </View>
        </View>
        <Tabs tabs={tabs} className="mt-4" />
      </View>
      <FlashList
        estimatedItemSize={72}
        ListFooterComponent={renderFooter}
        data={sections}
        getItemType={(item) =>
          typeof item === "string" ? "sectionHeader" : "row"
        }
        stickyHeaderIndices={sectionIndices}
        renderItem={({ item }) => {
          if (typeof item === "string") {
            if (!item) return null;

            return (
              <Text variant="body2" className="text-text-upcoming-title px-5">
                {item}
              </Text>
            );
          }
          return (
            <View className="mb-2">
              <TransactionItem
                data={item}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            </View>
          );
        }}
      />

      <BottomSheet visible={openTransactionForm} onDismiss={handleCloseForm}>
        <BudgetTransactionForm
          onSubmit={handleCreateTransaction}
          {...(selectedTransaction && {
            defaultValues: {
              ...selectedTransaction,
              amount: selectedTransaction.amount + "",
              date: new Date(selectedTransaction.date),
            } as any,
          })}
        />
      </BottomSheet>
    </ScreenContainer>
  );
}
