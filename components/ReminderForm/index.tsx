import { IReminderForm, reminderSchema } from "@/constants/validation";
import { date } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { DateTimePickerController } from "../DatetimePickerController";
import { InputController } from "../InputController";
import { PetPickerController } from "../PetPickerController";
import { Button } from "../ui/Button";

interface IProps {
  onSubmit: (data: IReminderForm) => Promise<void>;
}

export const ReminderForm = ({ onSubmit }: IProps) => {
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit } = useForm<IReminderForm>({
    resolver: zodResolver(reminderSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  const handleSubmitForm = (data: IReminderForm) => {
    startTransition(async () => {
      await onSubmit(data);
    });
  };
  return (
    <View className="px-4 pb-4">
      <InputController<IReminderForm>
        control={control}
        name="title"
        label="title"
        placeholder="title"
      />
      <InputController<IReminderForm>
        control={control}
        name="description"
        label="description"
        placeholder="description"
        multiline
      />
      <InputController<IReminderForm>
        control={control}
        name="address"
        label="address"
        placeholder="address"
      />
      <DateTimePickerController
        name="date"
        control={control}
        label="Event Date & Time"
        placeholder="Select date & time"
        mode="datetime"
        format={(val) => date(val).format("LLL")}
      />
      <PetPickerController
        name="petId"
        control={control}
        label="Choose your pet"
      />

      <Button
        onPress={() => handleSubmit(handleSubmitForm)()}
        disabled={isPending}
      >
        Set reminder
      </Button>
    </View>
  );
};
