import {
  budgetTransactionSchema,
  IBudgetTransactionForm,
  IBudgetTransactionFormInput,
  IBudgetTransactionFormOutput,
} from "@/constants/validation";
import { withBottomSheetKeyboardEvents } from "@/hocs/withBottomSheetKeyboardEvents";
import { IBudgetCategory } from "@/interfaces";
import { date, hexToRgba } from "@/utils";
import { DateTimePickerController } from "@/components/DatetimePickerController";
import { InputController } from "@/components/InputController";
import { OptionInputController } from "@/components/OptionInputController";
import { PaywallNotice } from "@/components/PaywallNotice";
import { Toast } from "@/components/Toast";
import { Button } from "@/components/ui/Button";
import { StateView } from "@/components/ui/StateView";
import { BUDGET_TRANSACTION_KEY, PET_KEY } from "@/constants/query-keys";
import { useEntitlements } from "@/features/subscriptions/useEntitlements";
import { getBudgetTransactionQuery, getListPetQuery } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";

interface IProps {
  onSubmit: (data: IBudgetTransactionForm) => Promise<void>;
  defaultValues?: IBudgetTransactionFormInput;
  categories: IBudgetCategory[];
  submitting?: boolean;
}

const EnhancedInputController = withBottomSheetKeyboardEvents(InputController);
const NO_PET_VALUE = "__no_pet__";

export const BudgetTransactionForm = ({
  onSubmit,
  defaultValues,
  categories,
  submitting,
}: IProps) => {
  const { control, handleSubmit } = useForm<
    IBudgetTransactionFormInput,
    unknown,
    IBudgetTransactionFormOutput
  >({
    resolver: zodResolver(budgetTransactionSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues,
  });

  const { data: pets } = useQuery({
    queryKey: PET_KEY.list(),
    queryFn: getListPetQuery,
  });

  const selectedDate = useWatch({ control, name: "date" });
  const isCreating = !defaultValues;
  const limitPeriod = dayjs(selectedDate ?? new Date());
  const limitMonth = limitPeriod.month() + 1;
  const limitYear = limitPeriod.year();
  const {
    entitlements,
    getLimitState,
    isError: isEntitlementsError,
    isLoading: isEntitlementsLoading,
    isUpgrading,
    refetch: refetchEntitlements,
    upgrade,
  } = useEntitlements();
  const baseTransactionLimit = getLimitState("maxBudgetTransactionsPerMonth");
  const shouldCheckMonthlyUsage =
    isCreating &&
    baseTransactionLimit.limit !== undefined &&
    baseTransactionLimit.limit >= 0;
  const monthlyUsageQuery = useQuery({
    queryKey: BUDGET_TRANSACTION_KEY.list({
      limit: 1,
      month: limitMonth,
      year: limitYear,
      usageCheck: true,
    }),
    queryFn: () =>
      getBudgetTransactionQuery({
        limit: 1,
        month: limitMonth,
        year: limitYear,
      }),
    enabled: shouldCheckMonthlyUsage,
  });
  const isCurrentMonth = limitPeriod.isSame(dayjs(), "month");
  const queriedUsage = monthlyUsageQuery.data?.meta.total;
  const entitlementUsage = entitlements?.usage.budgetTransactionsThisMonth;
  const checkedUsage = isCurrentMonth
    ? queriedUsage === undefined && entitlementUsage === undefined
      ? undefined
      : Math.max(queriedUsage ?? 0, entitlementUsage ?? 0)
    : queriedUsage;
  const transactionLimit = getLimitState(
    "maxBudgetTransactionsPerMonth",
    checkedUsage,
  );
  const isCheckingMonthlyUsage =
    shouldCheckMonthlyUsage &&
    checkedUsage === undefined &&
    monthlyUsageQuery.isLoading;
  const isMonthlyUsageError =
    shouldCheckMonthlyUsage &&
    checkedUsage === undefined &&
    monthlyUsageQuery.isError;

  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        label: c.name,
        value: c.id,
        icon: (
          <View
            className="p-4 rounded-8"
            style={{ backgroundColor: hexToRgba(c.color, 0.5) }}
          >
            <Text>{c.emoji}</Text>
          </View>
        ),
      })),
    [categories],
  );

  const petOptions = useMemo(
    () => [
      {
        label: "No specific pet",
        value: NO_PET_VALUE,
      },
      ...(pets?.data ?? []).map((pet) => ({
        label: pet.name,
        value: pet.id,
      })),
    ],
    [pets?.data],
  );

  const handleSubmitForm = async (data: IBudgetTransactionForm) => {
    if (isCreating && (isCheckingMonthlyUsage || isMonthlyUsageError)) {
      Toast.warn({
        title: "Could not confirm your transaction limit",
        text: "Try checking your plan again before adding this transaction.",
      });
      return;
    }

    if (isCreating && !transactionLimit.allowed) {
      Toast.warn({
        title: "Monthly transaction limit reached",
        text: "Choose another month or upgrade to Premium.",
      });
      return;
    }

    await onSubmit(data);
  };

  if (isCreating && isEntitlementsLoading && !entitlements) {
    return (
      <View className="min-h-240 px-26 pb-safe-offset-8">
        <StateView
          variant="loading"
          title="Checking your plan"
          description="Making sure there is room for another transaction."
        />
      </View>
    );
  }

  if (isCreating && isEntitlementsError && !entitlements) {
    return (
      <View className="min-h-240 px-26 pb-safe-offset-8">
        <StateView
          variant="error"
          title="Could not check your transaction limit"
          description="Check your connection and try again."
          actionLabel="Try again"
          onAction={() => void refetchEntitlements()}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="px-26 gap-16 pb-safe-offset-8"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {isCheckingMonthlyUsage ? (
        <StateView
          variant="loading"
          title="Checking this month"
          description="Confirming how many transactions are already saved."
          className="min-h-128 rounded-20 bg-background-surface-muted px-16 py-16"
        />
      ) : isMonthlyUsageError ? (
        <StateView
          variant="error"
          title="Could not check this month"
          description="Try again before adding this transaction."
          actionLabel="Try again"
          onAction={() => void monthlyUsageQuery.refetch()}
          className="min-h-128 rounded-20 bg-background-surface-muted px-16 py-16"
        />
      ) : isCreating && !transactionLimit.allowed ? (
        <PaywallNotice
          variant="inline"
          title="Monthly transaction limit reached"
          description={`Free plan includes ${transactionLimit.limit} transactions for ${limitPeriod.format("MMMM YYYY")}. Choose another month or upgrade to Premium.`}
          loading={isUpgrading}
          onAction={() => void upgrade()}
        />
      ) : null}

      <EnhancedInputController
        control={control}
        name="description"
        label="Description"
        placeholder="Description"
      />
      <EnhancedInputController
        control={control}
        name="amount"
        label="Amount"
        placeholder="Amount"
        keyboardType="numeric"
        format={(v: string) => {
          const numericValue = v.replace(/[^0-9]/g, "");
          return Number(numericValue).toLocaleString();
        }}
      />
      <OptionInputController<
        IBudgetTransactionFormInput,
        IBudgetTransactionFormOutput
      >
        control={control}
        name="categoryId"
        label="Category"
        placeholder="Select category"
        options={categoryOptions}
      />
      <OptionInputController<
        IBudgetTransactionFormInput,
        IBudgetTransactionFormOutput
      >
        control={control}
        name="petId"
        label="Pet"
        placeholder="No specific pet"
        options={petOptions}
      />
      <DateTimePickerController<
        IBudgetTransactionFormInput,
        IBudgetTransactionFormOutput
      >
        name="date"
        control={control}
        label="Date"
        placeholder="Select date"
        mode="date"
        format={(val) => date(val).format("LL")}
        maximumDate={new Date()}
      />

      <Button
        wrapperClassName="mt-20"
        onPress={() => handleSubmit(handleSubmitForm)()}
        loading={submitting}
        disabled={
          isCreating &&
          (isCheckingMonthlyUsage ||
            isMonthlyUsageError ||
            !transactionLimit.allowed)
        }
      >
        {!!defaultValues ? "Update transaction" : "Add transaction"}
      </Button>
    </KeyboardAvoidingView>
  );
};
