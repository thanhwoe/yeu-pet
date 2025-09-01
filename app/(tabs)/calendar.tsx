import { Calendar } from "@/components/Calendar";
import { ReminderHeader } from "@/components/Headers/ReminderHeader";
import { ReminderForm } from "@/components/ReminderForm";
import { Skeleton } from "@/components/Skeleton";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Text } from "@/components/ui/Text";
import { PET_KEY, REMINDER_KEY } from "@/constants/query-keys";
import { IReminderForm } from "@/constants/validation";
import { IReminderInfo } from "@/interfaces";
import {
  createReminderMutation,
  deleteReminderMutation,
  getListPetQuery,
  getListReminderQuery,
  updateReminderMutation,
} from "@/services";
import { cancelSchedulePushNotification, schedulePushNotification, updateSchedulePushNotification } from "@/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, View } from "react-native";

export default function Screen() {
  const [openForm, setOpenForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IReminderInfo | null>(null);

  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: REMINDER_KEY.list(),
    queryFn: () => getListReminderQuery(),
  });

  const { data: petData } = useQuery({
    queryKey: PET_KEY.list(),
    queryFn: getListPetQuery,
  });

  const { mutate: createReminder } = useMutation({
    mutationFn: createReminderMutation,
    onSuccess: (response) => {
      schedulePushNotification(response.data);
      queryClient.invalidateQueries({ queryKey: REMINDER_KEY.list() });
      setOpenForm(false);
    },
    onError: () => { },
  });

  const { mutate: updateReminder } = useMutation({
    mutationFn: updateReminderMutation,
    onSuccess: (response) => {
      updateSchedulePushNotification(response.data);
      queryClient.invalidateQueries({ queryKey: REMINDER_KEY.list() });
      setOpenForm(false);
      setSelectedItem(null);
    },
    onError: () => { },
  });

  const { mutate: deleteReminder } = useMutation({
    mutationFn: deleteReminderMutation,
    onSuccess: (response) => {
      cancelSchedulePushNotification(response.data);
      queryClient.invalidateQueries({ queryKey: REMINDER_KEY.list() });
    },
    onError: () => { },
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

  const handlePressAddButton = () => {
    if (petData?.data.length) {
      setOpenForm(true);
    } else {
      // TODO: show toast
    }
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedItem(null);
  };

  return (
    <View className="flex-1 pt-safe-or-4 bg-background-screen">
      <ReminderHeader onAddReminder={handlePressAddButton} />
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
      <BottomSheet visible={openForm} onDismiss={handleCloseForm}
        titleElement={<Text className="font-medium">
          {selectedItem ? "Edit Reminder" : "Create Reminder"}
        </Text>}

      >
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
