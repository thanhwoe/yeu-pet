import { REMINDER_KEY } from "@/constants/query-keys";
import { IReminderForm } from "@/constants/validation";
import { IReminder } from "@/interfaces";
import {
  deleteReminderMutation,
  getListReminderQuery,
  updateReminderMutation,
} from "@/services";
import { getMarkedDates, groupReminder } from "@/utils/reminder";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { CalendarProvider, DateData } from "react-native-calendars";
import { Popup } from "../Popup";
import { ReminderForm } from "../ReminderForm";
import { Toast } from "../Toast";
import { BottomSheet } from "../ui/BottomSheet";
import { Body } from "../ui/Typography";
import { AgendaList } from "./AgendaList";
import { Calendar } from "./Calendar";

const currentDate = dayjs().toString();

export const ReminderCalendar = () => {
  const [agendaEdit, setAgendaEdit] = useState<IReminder>();
  const [agendaDelete, setAgendaDelete] = useState<IReminder>();
  const [calendarDate, setCalendarDate] = useState<DateData>();

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: REMINDER_KEY.list({
      month: calendarDate?.month,
      year: calendarDate?.year,
    }),
    queryFn: () =>
      getListReminderQuery({
        month: calendarDate?.month,
        year: calendarDate?.year,
      }),
  });

  const { mutateAsync: updateReminder, isPending: isUpdating } = useMutation({
    mutationFn: updateReminderMutation,
    onError(e) {
      Toast.error({ text: e.message });
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: REMINDER_KEY.lists() });
      setAgendaEdit(undefined);
    },
  });

  const { mutateAsync: deleteReminder, isPending: isDeleting } = useMutation({
    mutationFn: deleteReminderMutation,
    onError(e) {
      Toast.error({ text: e.message });
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: REMINDER_KEY.lists() });
      setAgendaDelete(undefined);
    },
  });

  const { groupData, marked } = useMemo(() => {
    const groupData = groupReminder(data?.data ?? []);

    const marked = getMarkedDates(groupData);
    return {
      groupData,
      marked,
    };
  }, [data]);

  const handleUpdate = useCallback(
    async (data: IReminderForm) => {
      if (agendaEdit?.id) {
        updateReminder({ ...data, id: agendaEdit.id });
      }
    },
    [agendaEdit?.id, updateReminder],
  );

  const handleDelete = useCallback(() => {
    if (agendaDelete?.id) {
      deleteReminder(agendaDelete.id);
    }
  }, [agendaDelete?.id, deleteReminder]);

  const handleCancel = useCallback(() => setAgendaDelete(undefined), []);

  const defaultValue: IReminderForm | undefined = useMemo(() => {
    if (!agendaEdit) {
      return;
    }
    return {
      scheduledAt: dayjs(agendaEdit?.scheduledAt).toDate(),
      title: agendaEdit?.title,
      type: agendaEdit?.type,
      description: agendaEdit?.description ?? "",
      petId: agendaEdit?.petId,
    };
  }, [agendaEdit]);

  return (
    <View className="flex-1 mx-20">
      <CalendarProvider date={currentDate} onMonthChange={setCalendarDate}>
        <View className="gap-4 flex-1">
          <Calendar
            marked={marked}
            calendarClassName="bg-background-calendar"
            arrowClassName="text-text-secondary"
            weekTitleClassName="text-text-primary"
          />
          <AgendaList
            key={calendarDate?.month}
            onEdit={setAgendaEdit}
            data={groupData}
            onDelete={setAgendaDelete}
            deleting={isDeleting}
            updating={isUpdating}
            loading={isLoading}
          />
        </View>
      </CalendarProvider>
      <BottomSheet
        visible={!!agendaEdit}
        onDismiss={() => setAgendaEdit(undefined)}
        useScrollView
        titleElement={<Body weight="semiBold">Edit Reminder</Body>}
      >
        <ReminderForm
          onSubmit={handleUpdate}
          defaultValues={defaultValue}
          loading={isUpdating}
        />
      </BottomSheet>
      <Popup
        visible={!!agendaDelete}
        onCancel={handleCancel}
        onConfirm={handleDelete}
        title="Remove reminder"
        description="Are you sure you want to remove this reminder?"
        variant="delete"
        loading={isDeleting}
      />
    </View>
  );
};
