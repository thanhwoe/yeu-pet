import { Calendar } from "@/components/Calendar";
import { ReminderHeader } from "@/components/Headers/ReminderHeader";
import { ReminderForm } from "@/components/ReminderForm";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { useState } from "react";
import { View } from "react-native";

export default function TabTwoScreen() {
  const [openForm, setOpenForm] = useState(false);
  return (
    <View className="flex-1 pt-safe-or-4 bg-orange-50">
      <ReminderHeader onAddReminder={() => setOpenForm(true)} />
      <Calendar onEditAgenda={() => setOpenForm(true)} />
      <BottomSheet visible={openForm} onDismiss={() => setOpenForm(false)}>
        <ReminderForm onSubmit={async (data) => {}} />
      </BottomSheet>
    </View>
  );
}
