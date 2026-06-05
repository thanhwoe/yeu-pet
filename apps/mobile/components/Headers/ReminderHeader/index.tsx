import { ReminderForm } from "@/features/reminders/components/ReminderForm";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Body, Heading } from "@/components/ui/Typography";
import { useCreateReminderSheet } from "@/features/reminders/hooks";
import { withIconClassName } from "@/hocs/withIconClassName";
import { PlusIcon } from "phosphor-react-native";
import { TouchableOpacity, View } from "react-native";

const AddIcon = withIconClassName(PlusIcon);

export const ReminderHeader = () => {
  const {
    isCreating,
    openForm,
    handleCloseForm,
    handleCreateReminder,
    handleOpenForm,
  } = useCreateReminderSheet();

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
        onDismiss={handleCloseForm}
        useScrollView
        titleElement={<Body weight="semiBold">Create Reminder</Body>}
      >
        <ReminderForm onSubmit={handleCreateReminder} loading={isCreating} />
        <View />
      </BottomSheet>
    </>
  );
};
