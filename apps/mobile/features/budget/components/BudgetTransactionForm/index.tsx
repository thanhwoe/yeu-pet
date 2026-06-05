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
import { Button } from "@/components/ui/Button";
import { PET_KEY } from "@/constants/query-keys";
import { getListPetQuery } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
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

  return (
    <KeyboardAvoidingView
      className="px-26 gap-16 pb-safe-offset-8"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
        onPress={() => handleSubmit(onSubmit)()}
        loading={submitting}
      >
        {!!defaultValues ? "Update transaction" : "Add transaction"}
      </Button>
    </KeyboardAvoidingView>
  );
};
