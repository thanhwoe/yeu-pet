import { Calendar } from "@/components/Calendar";
import { ReminderHeader } from "@/components/Headers/ReminderHeader";
import { ReminderForm } from "@/components/ReminderForm";
import { Skeleton } from "@/components/Skeleton";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { REMINDER_KEY } from "@/constants/query-keys";
import { IReminderForm } from "@/constants/validation";
import { IReminderInfo } from "@/interfaces";
import {
  createReminderMutation,
  deleteReminderMutation,
  getListReminderQuery,
  updateReminderMutation,
} from "@/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, View } from "react-native";

export default function TabTwoScreen() {
  const [openForm, setOpenForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IReminderInfo | null>(null);

  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: REMINDER_KEY.list(),
    queryFn: getListReminderQuery,
  });

  const { mutate: createReminder } = useMutation({
    mutationFn: createReminderMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDER_KEY.list() });
      setOpenForm(false);
    },
    onError: () => {},
  });

  const { mutate: updateReminder } = useMutation({
    mutationFn: updateReminderMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDER_KEY.list() });
      setOpenForm(false);
      setSelectedItem(null);
    },
    onError: () => {},
  });

  const { mutate: deleteReminder } = useMutation({
    mutationFn: deleteReminderMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDER_KEY.list() });
    },
    onError: () => {},
  });

  const handleCreateReminder = async (data: IReminderForm) => {
    if (selectedItem) {
      updateReminder({
        ...data,
        id: selectedItem.id,
      });
    } else {
      createReminder(data);
    }
  };

  const handleDeleteReminder = (id: string) => {
    Alert.alert(
      "Remove Reminder",
      "Are you sure you want to remove this reminder?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: () => {
            deleteReminder(id);
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View className="flex-1 pt-safe-or-4 bg-orange-50">
      <ReminderHeader onAddReminder={() => setOpenForm(true)} />
      {isLoading ? (
        <Skeleton className="h-[300px]" />
      ) : (
        <Calendar
          onEditAgenda={(item) => {
            setOpenForm(true);
            setSelectedItem(item);
          }}
          onDeleteAgenda={(item) => handleDeleteReminder(item.id)}
          data={data?.data ?? []}
        />
      )}
      <BottomSheet visible={openForm} onDismiss={() => setOpenForm(false)}>
        <ReminderForm
          onSubmit={handleCreateReminder}
          {...(selectedItem && {
            defaultValues: {
              event_date: new Date(selectedItem.time),
              title: selectedItem.title,
              description: selectedItem.description,
              pet_id: selectedItem.petId,
              type: selectedItem.type as any,
            },
          })}
        />
      </BottomSheet>
    </View>
  );
}
