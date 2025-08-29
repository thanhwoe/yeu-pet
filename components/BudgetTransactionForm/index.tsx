import {
  budgetTransactionSchema,
  IBudgetTransactionForm,
} from "@/constants/validation";
import { date } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { DateTimePickerController } from "../DatetimePickerController";
import { InputController } from "../InputController";
import { OptionInputController } from "../OptionInputController";
import { ReminderIcons } from "../ReminderIcons";
import { Button } from "../ui/Button";

interface IProps {
  onSubmit: (data: IBudgetTransactionForm) => Promise<void>;
  defaultValues?: IBudgetTransactionForm;
}

export const BudgetTransactionForm = ({ onSubmit, defaultValues }: IProps) => {
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit } = useForm<IBudgetTransactionForm>({
    resolver: zodResolver(budgetTransactionSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues,
  });

  const handleSubmitForm = (data: IBudgetTransactionForm) => {
    startTransition(async () => {
      await onSubmit(data);
    });
  };
  return (
    <View className="px-4 pb-4">
      <InputController<IBudgetTransactionForm>
        control={control}
        name="content"
        label="Content"
        placeholder="Content"
      />
      <InputController<IBudgetTransactionForm>
        control={control}
        name="amount"
        label="Amount"
        placeholder="Amount"
        inputMode="decimal"
      />
      <OptionInputController<IBudgetTransactionForm>
        control={control}
        name="type"
        label="Type"
        placeholder="Type"
        options={[
          {
            label: "Feed",
            value: "feed",
            icon: <ReminderIcons type="feed" />,
          },
          {
            label: "Grooming",
            value: "grooming",
            icon: <ReminderIcons type="grooming" />,
          },
          {
            label: "Vaccination",
            value: "vaccination",
            icon: <ReminderIcons type="vaccination" />,
          },
          {
            label: "Medication",
            value: "medication",
            icon: <ReminderIcons type="medication" />,
          },
        ]}
      />
      <DateTimePickerController
        name="date"
        control={control}
        label="Event Date"
        placeholder="Select date"
        mode="date"
        format={(val) => date(val).format("LL")}
        maximumDate={new Date()}
      />

      <Button
        onPress={() => handleSubmit(handleSubmitForm)()}
        disabled={isPending}
        className="mt-4"
        loading={isPending}
      >
        {!!defaultValues ? "Update transaction" : "Add transaction"}
      </Button>
    </View>
  );
};
