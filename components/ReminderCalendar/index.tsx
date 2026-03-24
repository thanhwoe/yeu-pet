import { REMINDER_KEY } from "@/constants/query-keys";
import { IReminderForm } from "@/constants/validation";
import { IReminder } from "@/interfaces";
import { deleteReminderMutation, updateReminderMutation } from "@/services";
import { getMarkedDates, groupReminder } from "@/utils/reminder";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { AgendaList, CalendarProvider } from "react-native-calendars";
import { Popup } from "../Popup";
import { ReminderForm } from "../ReminderForm";
import { Skeleton } from "../Skeleton";
import { Toast } from "../Toast";
import { BottomSheet } from "../ui/BottomSheet";
import { Body, Heading } from "../ui/Typography";
import { AgendaDate } from "./AgendaDate";
import { AgendaItem } from "./AgendaItem";
import { Calendar } from "./Calendar";

interface IProps {
  data: IReminder[];
  loading?: boolean;
}

export const ReminderCalendar = ({ data, loading }: IProps) => {
  const [agendaEdit, setAgendaEdit] = useState<IReminder>();
  const [agendaDelete, setAgendaDelete] = useState<IReminder>();

  const queryClient = useQueryClient();

  const { mutateAsync: updateReminder, isPending: isUpdating } = useMutation({
    mutationFn: updateReminderMutation,
    onError(e) {
      Toast.error({ text: e.message });
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: REMINDER_KEY.list() });
      setAgendaEdit(undefined);
    },
  });

  const { mutateAsync: deleteReminder, isPending: isDeleting } = useMutation({
    mutationFn: deleteReminderMutation,
    onError(e) {
      Toast.error({ text: e.message });
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: REMINDER_KEY.list() });
      setAgendaDelete(undefined);
    },
  });

  const { groupData, marked } = useMemo(() => {
    const groupData = groupReminder(data);

    const marked = getMarkedDates(groupData);
    return {
      groupData,
      marked,
    };
  }, [data]);

  const renderItem = useCallback(
    ({ item }: { item: IReminder }) => {
      const handleEdit = (v: IReminder) => {
        if (v.status !== "pending") {
          Toast.warn({
            text: "Reminder sent or cancelled cannot update. Please create new one.",
            title: "Cannot edit this reminder",
            duration: 10_000,
          });
          return;
        }
        setAgendaEdit(v);
      };
      return (
        <AgendaItem
          item={item}
          onEdit={handleEdit}
          onDelete={setAgendaDelete}
          editing={isUpdating}
          deleting={isDeleting}
        />
      );
    },
    [isDeleting, isUpdating],
  );

  const handleUpdate = useCallback(
    async (data: IReminderForm) => {
      if (agendaEdit?.id) {
        updateReminder({
          ...data,
          id: agendaEdit.id,
        });
      }
    },
    [agendaEdit?.id, updateReminder],
  );

  const handleDelete = useCallback(() => {
    if (agendaDelete?.id) {
      deleteReminder(agendaDelete?.id);
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

  const ListEmptyComponent = useMemo(() => {
    if (loading) {
      return (
        <View className="gap-16 mt-20">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </View>
      );
    }
    return (
      <View className="mt-40 gap-8">
        <Heading variant="h5" center>
          No reminders added yet.
        </Heading>
        <Body center>Start by adding your first one!</Body>
      </View>
    );
  }, [loading]);

  return (
    <View className="flex-1 mx-20">
      <CalendarProvider
        date={dayjs().toString()}
        // onDateChanged={onDateChanged}
        // onMonthChange={onMonthChange}
        // disabledOpacity={0.6}
      >
        <View className="gap-4 flex-1">
          <Calendar
            marked={marked}
            calendarClassName="bg-background-calendar"
            arrowClassName="text-text-secondary"
            weekTitleClassName="text-text-primary"
          />

          <AgendaList
            sections={groupData}
            renderItem={renderItem}
            scrollToNextEvent={false}
            renderSectionHeader={AgendaDate}
            removeClippedSubviews
            style={{
              flex: 1,
            }}
            ListEmptyComponent={ListEmptyComponent}
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
