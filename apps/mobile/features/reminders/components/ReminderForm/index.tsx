import { PET_KEY } from "@/constants/query-keys";
import { IReminderForm, reminderSchema } from "@/constants/validation";
import { getListPetQuery } from "@/services";
import { date } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";

import { withBottomSheetKeyboardEvents } from "@/hocs/withBottomSheetKeyboardEvents";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform } from "react-native";
import { DateTimePickerController } from "@/components/DatetimePickerController";
import { InputController } from "@/components/InputController";
import { OptionInputController } from "@/components/OptionInputController";
import { PetPickerController } from "@/components/PetPickerController";
import { Button } from "@/components/ui/Button";
import { ReminderTypeIcon } from "@/features/reminders/components/ReminderIcons";

const EnhancedInputController = withBottomSheetKeyboardEvents(InputController);

interface IProps {
  onSubmit: (data: IReminderForm) => Promise<void>;
  defaultValues?: IReminderForm;
  loading?: boolean;
}

export const ReminderForm = ({ onSubmit, defaultValues, loading }: IProps) => {
  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<IReminderForm>({
    resolver: zodResolver(reminderSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues,
  });

  const { data } = useQuery({
    queryKey: PET_KEY.list(),
    queryFn: getListPetQuery,
  });

  const handleSubmitForm = (data: IReminderForm) => {
    onSubmit(data);
  };
  return (
    <KeyboardAvoidingView
      className="px-26 gap-16 pb-safe-offset-8"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <PetPickerController
        name="petId"
        control={control}
        label="Choose your pet"
        options={data?.data ?? []}
      />
      <EnhancedInputController
        control={control}
        name="title"
        label="Title"
        placeholder="Title"
      />
      <EnhancedInputController
        control={control}
        name="description"
        label="Description"
        placeholder="Description"
        multiline
      />
      <OptionInputController<IReminderForm>
        control={control}
        name="type"
        label="Type"
        placeholder="Type"
        options={[
          {
            label: "Feeding",
            value: "feeding",
            icon: <ReminderTypeIcon type="feeding" />,
          },
          {
            label: "Grooming",
            value: "grooming",
            icon: <ReminderTypeIcon type="grooming" />,
          },
          {
            label: "Vaccination",
            value: "vaccination",
            icon: <ReminderTypeIcon type="vaccination" />,
          },
          {
            label: "Medication",
            value: "medication",
            icon: <ReminderTypeIcon type="medication" />,
          },
        ]}
      />
      <DateTimePickerController
        name="scheduledAt"
        control={control}
        label="Schedule Date & Time"
        placeholder="Select date & time"
        mode="datetime"
        minimumDate={new Date()}
        format={(val) => date(val).format("LLL")}
      />

      <Button
        onPress={() => handleSubmit(handleSubmitForm)()}
        className="mt-16"
        disabled={!isDirty}
        loading={loading}
      >
        {!!defaultValues ? "Update Reminder" : "Set Reminder"}
      </Button>
    </KeyboardAvoidingView>
  );
};
