import { BottomSheet } from "@/components/ui/BottomSheet";
import { Text } from "@/components/ui/Text";
import { BUDGET_KEY } from "@/constants/query-keys";
import { withIconClassName } from "@/hocs/withIconClassName";
import { withLoading } from "@/hocs/withLoading";
import { getBudgetQuery, updateBudgetMutation } from "@/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardTextIcon, PencilSimpleIcon } from "phosphor-react-native";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { BudgetInput } from "./BudgetInput";

const EditIcon = withIconClassName(PencilSimpleIcon);
const ClipboardIcon = withIconClassName(ClipboardTextIcon);
const LoadableText = withLoading(Text);

export const BudgetSection = () => {
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: BUDGET_KEY.details(),
    queryFn: getBudgetQuery,
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: updateBudgetMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_KEY.details() });
      setShowBottomSheet(false);
    },
    onError: () => {},
  });

  const { monthly_budget, remaining_balance, spent_balance } = data?.data || {};

  return (
    <>
      <View className="bg-background-card-info p-4 rounded-2xl gap-4">
        <View className="flex-row items-center gap-2">
          <ClipboardIcon size={18} weight="bold" />
          <Text className="font-bold">This month</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="font-medium">Spent balance</Text>
          <LoadableText
            isLoading={isLoading}
            loadingClassName="w-[60px] h-[20px]"
            className="font-bold text-text-highlight-swarthy"
          >
            ${spent_balance?.toLocaleString()}
          </LoadableText>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="font-medium">Remaining balance</Text>
          <LoadableText
            isLoading={isLoading}
            loadingClassName="w-[60px] h-[20px]"
            className="font-bold text-text-highlight-swarthy"
          >
            ${remaining_balance?.toLocaleString()}
          </LoadableText>
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
            <TouchableOpacity onPress={() => setShowBottomSheet(true)}>
              <EditIcon size={18} weight="bold" />
            </TouchableOpacity>
          </View>
          <LoadableText
            isLoading={isLoading}
            loadingClassName="w-[60px] h-[20px]"
            className="font-bold text-text-highlight"
          >
            ${monthly_budget?.toLocaleString()}
          </LoadableText>
        </View>
      </View>
      <BottomSheet
        visible={showBottomSheet}
        onDismiss={() => setShowBottomSheet(false)}
        snapPoints={undefined}
        titleElement={<Text className="font-medium">Set monthly budget</Text>}
        useScrollView
        stackBehavior="push"
        keyboardBehavior="interactive"
      >
        <BudgetInput
          onSubmit={(v) => {
            mutateAsync({ monthly_budget: v });
          }}
          isLoading={isPending}
          defaultValue={monthly_budget}
        />
      </BottomSheet>
    </>
  );
};
