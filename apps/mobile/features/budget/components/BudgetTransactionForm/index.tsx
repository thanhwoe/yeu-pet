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
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        label: t("budget.form.pet.noSpecific"),
        value: NO_PET_VALUE,
      },
      ...(pets?.data ?? []).map((pet) => ({
        label: pet.name,
        value: pet.id,
      })),
    ],
    [pets?.data, t],
  );

  const handleSubmitForm = async (data: IBudgetTransactionForm) => {
    if (isCreating && (isCheckingMonthlyUsage || isMonthlyUsageError)) {
      Toast.warn({
        title: t("budget.limit.confirmErrorTitle"),
        text: t("budget.limit.confirmErrorText"),
      });
      return;
    }

    if (isCreating && !transactionLimit.allowed) {
      Toast.warn({
        title: t("budget.limit.limitReachedTitle"),
        text: t("budget.limit.limitReachedText"),
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
          title={t("budget.limit.loadingTitle")}
          description={t("budget.limit.loadingDescription")}
        />
      </View>
    );
  }

  if (isCreating && isEntitlementsError && !entitlements) {
    return (
      <View className="min-h-240 px-26 pb-safe-offset-8">
        <StateView
          variant="error"
          title={t("budget.limit.transactionLimitErrorTitle")}
          description={t("budget.limit.transactionLimitErrorDescription")}
          actionLabel={t("common.tryAgain")}
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
          title={t("budget.limit.checkMonthTitle")}
          description={t("budget.limit.checkMonthDescription")}
          className="min-h-128 rounded-20 bg-background-surface-muted px-16 py-16"
        />
      ) : isMonthlyUsageError ? (
        <StateView
          variant="error"
          title={t("budget.limit.monthErrorTitle")}
          description={t("budget.limit.monthErrorDescription")}
          actionLabel={t("common.tryAgain")}
          onAction={() => void monthlyUsageQuery.refetch()}
          className="min-h-128 rounded-20 bg-background-surface-muted px-16 py-16"
        />
      ) : isCreating && !transactionLimit.allowed ? (
        <PaywallNotice
          variant="inline"
          title={t("budget.limit.limitReachedTitle")}
          description={t("budget.limit.limitReachedDescription", {
            limit: transactionLimit.limit,
            period: limitPeriod.format("MMMM YYYY"),
          })}
          loading={isUpgrading}
          onAction={() => void upgrade()}
        />
      ) : null}

      <EnhancedInputController
        control={control}
        name="description"
        label={t("budget.form.description.label")}
        placeholder={t("budget.form.description.placeholder")}
      />
      <EnhancedInputController
        control={control}
        name="amount"
        label={t("budget.form.amount.label")}
        placeholder={t("budget.form.amount.placeholder")}
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
        label={t("budget.form.category.label")}
        placeholder={t("budget.form.category.placeholder")}
        options={categoryOptions}
      />
      <OptionInputController<
        IBudgetTransactionFormInput,
        IBudgetTransactionFormOutput
      >
        control={control}
        name="petId"
        label={t("budget.form.pet.label")}
        placeholder={t("budget.form.pet.noSpecific")}
        options={petOptions}
      />
      <DateTimePickerController<
        IBudgetTransactionFormInput,
        IBudgetTransactionFormOutput
      >
        name="date"
        control={control}
        label={t("budget.form.date.label")}
        placeholder={t("budget.form.date.placeholder")}
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
        {defaultValues
          ? t("budget.actions.updateTransaction")
          : t("budget.actions.addTransaction")}
      </Button>
    </KeyboardAvoidingView>
  );
};
