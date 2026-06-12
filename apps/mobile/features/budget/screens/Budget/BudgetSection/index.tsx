import {
  CURRENT_MONTH,
  CURRENT_YEAR,
} from "@/components/MonthYearPicker/utils";
import { Toast } from "@/components/Toast";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Body, Heading } from "@/components/ui/Typography";
import { BUDGET_KEY } from "@/constants/query-keys";
import { withIconClassName } from "@/hocs/withIconClassName";
import { withLoading } from "@/hocs/withLoading";
import { IBudget } from "@/interfaces";
import { updateBudgetMutation } from "@/services";
import { cn } from "@/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { WalletIcon } from "phosphor-react-native";
import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";
import { TouchableOpacity, View } from "react-native";
import { BudgetInput } from "./BudgetInput";

const EditIcon = withIconClassName(WalletIcon);
const LoadableBody = withLoading(Body);
const LoadableHeading = withLoading(Heading);

export interface BudgetSectionRef {
  openForm: () => void;
}

interface IProps {
  data?: IBudget;
  loading?: boolean;
}

export const BudgetSection = memo(
  forwardRef<BudgetSectionRef, IProps>(({ data, loading }, ref) => {
    const [showBottomSheet, setShowBottomSheet] = useState(false);

    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
      mutationFn: updateBudgetMutation,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: BUDGET_KEY.details() });
        setShowBottomSheet(false);
      },
      onError: (e) => {
        Toast.error({ text: e.message });
      },
    });

    useImperativeHandle(
      ref,
      useCallback(
        () => ({
          openForm: () => setShowBottomSheet(true),
        }),
        [],
      ),
    );

    const {
      amount,
      remaining,
      spent,
      isOverBudget,
      usagePercent,
      month = CURRENT_MONTH,
      year = CURRENT_YEAR,
    } = data || {};

    return (
      <>
        <View className="rounded-16 bg-background-card-highlight py-16 px-24 gap-8">
          <View className="flex-row justify-between items-center">
            <View className="gap-8 flex-1 mr-12">
              <Body>Monthly budget</Body>
              <LoadableHeading
                loading={loading}
                loadingSize="w-120 h-50"
                adjustsFontSizeToFit
              >
                {amount?.toLocaleString()}
              </LoadableHeading>
            </View>
            <TouchableOpacity
              disabled={loading}
              accessibilityLabel="Edit monthly budget"
              accessibilityRole="button"
              accessibilityState={{ disabled: loading }}
              onPress={() => setShowBottomSheet(true)}
              className="p-8 bg-background-secondary rounded-16"
            >
              <EditIcon
                weight="fill"
                className={cn("text-icon-primary", {
                  "text-icon-negative": isOverBudget,
                })}
                size={50}
              />
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-between items-center">
            <LoadableBody
              loading={loading}
              loadingSize="w-120 h-20"
              weight="bold"
              className="flex-1 mr-8"
            >
              Spent: {spent?.toLocaleString()}
            </LoadableBody>
            <LoadableBody loading={loading} loadingSize="w-40 h-20">
              {usagePercent}%
            </LoadableBody>
          </View>
          <ProgressBar progress={usagePercent} height={12} key={usagePercent} />
          <View className="flex-row justify-between items-center mt-8">
            <Body weight="semiBold">Remaining</Body>
            <View className="flex-1 ml-8">
              <LoadableHeading
                loading={loading}
                loadingSize="w-80 h-32"
                variant="h4"
                weight="bold"
                className={cn("self-end", {
                  "text-text-negative": isOverBudget,
                })}
              >
                {remaining?.toLocaleString()}
              </LoadableHeading>
            </View>
          </View>
        </View>

        <BottomSheet
          visible={showBottomSheet}
          onDismiss={() => setShowBottomSheet(false)}
          titleElement={<Body weight="semiBold">Set monthly budget</Body>}
          useScrollView
          keyboardBehavior="interactive"
        >
          <BudgetInput
            onSubmit={(v) => {
              mutateAsync({ amount: v, month, year });
            }}
            isLoading={isPending}
            defaultValue={amount}
          />
        </BottomSheet>
      </>
    );
  }),
);

BudgetSection.displayName = "BudgetSection";
