import { ReminderForm } from "@/components/ReminderForm";
import { Toast } from "@/components/Toast";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Body, Heading } from "@/components/ui/Typography";
import { PET_KEY, REMINDER_KEY } from "@/constants/query-keys";
import { IReminderForm } from "@/constants/validation";
import { withIconClassName } from "@/hocs/withIconClassName";
import { createReminderMutation, getListPetQuery } from "@/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "phosphor-react-native";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

const AddIcon = withIconClassName(PlusIcon);

export const ReminderHeader = () => {
  const [openForm, setOpenForm] = useState(false);

  const queryClient = useQueryClient();

  const { data: petData } = useQuery({
    queryKey: PET_KEY.list(),
    queryFn: getListPetQuery,
  });

  const { mutateAsync: createReminder } = useMutation({
    mutationFn: createReminderMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDER_KEY.lists() });
      setOpenForm(false);
    },
    onError: (e) => {
      Toast.error({ text: e.message });
    },
  });

  const handleCreateReminder = async (data: IReminderForm) => {
    createReminder(data);
  };

  const handleOpenForm = () => {
    if (petData?.data.length) {
      setOpenForm(true);
    } else {
      Toast.warn({ text: "Please add pet first" });
    }
  };
  return (
    <>
      <View className="flex-row items-center justify-between px-20 pt-safe bg-background">
        <Heading variant="h4" weight="bold" className="text-text-secondary">
          My Reminders
        </Heading>
        <TouchableOpacity
          className="bg-background-secondary-pressed p-8 rounded-8"
          onPress={handleOpenForm}
        >
          <AddIcon className="text-icon-primary" weight="bold" />
        </TouchableOpacity>
      </View>
      <BottomSheet
        visible={openForm}
        onDismiss={() => setOpenForm(false)}
        useScrollView
        titleElement={<Body weight="semiBold">Create Reminder</Body>}
      >
        <ReminderForm onSubmit={handleCreateReminder} />
        <View />
      </BottomSheet>
    </>
  );
};
