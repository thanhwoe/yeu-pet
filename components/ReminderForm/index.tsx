import { PET_KEY } from "@/constants/query-keys";
import { IReminderForm, reminderSchema } from "@/constants/validation";
import { getListPetQuery } from "@/services";
import { date } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { DateTimePickerController } from "../DatetimePickerController";
import { InputController } from "../InputController";
import { OptionInputController } from "../OptionInputController";
import { PetPickerController } from "../PetPickerController";
import { ReminderIcons } from "../ReminderIcons";
import { Skeleton } from "../Skeleton";
import { Button } from "../ui/Button";
import { Text } from "../ui/Text";

interface IProps {
  onSubmit: (data: IReminderForm) => Promise<void>;
  defaultValues?: IReminderForm;
}

export const ReminderForm = ({ onSubmit, defaultValues }: IProps) => {
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit } = useForm<IReminderForm>({
    resolver: zodResolver(reminderSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues,
  });

  const { data, isLoading } = useQuery({
    queryKey: PET_KEY.list(),
    queryFn: getListPetQuery,
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
      <OptionInputController<IReminderForm>
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
        name="event_date"
        control={control}
        label="Event Date & Time"
        placeholder="Select date & time"
        mode="datetime"
        minimumDate={new Date()}
        format={(val) => date(val).format("LLL")}
      />
      {isLoading ? (
        <View>
          <Text variant="footnote">Choose your pet</Text>
          <View className="flex-row gap-3 py-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton className="w-14 h-14 rounded-full" key={index} />
            ))}
          </View>
        </View>
      ) : (
        <PetPickerController
          name="pet_id"
          control={control}
          label="Choose your pet"
          options={data?.data ?? []}
        />
      )}

      <Button
        onPress={() => handleSubmit(handleSubmitForm)()}
        disabled={isPending}
        className="mt-4"
        loading={isPending}
      >
        {!!defaultValues ? "Update Reminder" : "Set Reminder"}
      </Button>
    </View>
  );
};
