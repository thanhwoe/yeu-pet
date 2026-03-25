import { REMINDER_KEY } from "@/constants/query-keys";
import { IReminderForm } from "@/constants/validation";
import { IReminder } from "@/interfaces";
import {
  deleteReminderMutation,
  getListReminderQuery,
  updateReminderMutation,
} from "@/services";
import { getMarkedDates, groupReminder } from "@/utils/reminder";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import dayjs from "dayjs";
import { useCallback, useMemo, useRef, useState } from "react";
import { SectionList, View } from "react-native";
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

  const listRef = useRef<SectionList>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: REMINDER_KEY.list({
        limit: 10,
        month: calendarDate?.month,
        year: calendarDate?.year,
      }),
      queryFn: ({ pageParam }) =>
        getListReminderQuery({
          limit: 10,
          page: pageParam,
          month: calendarDate?.month,
          year: calendarDate?.year,
        }),

      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        if (!lastPage.meta.hasNextPage) return undefined;
        return lastPage.meta.page + 1;
      },
      select: (data) => data?.pages.flatMap((item) => item.data) || [],
    });

  const handleFetchMore = useCallback(() => {
    hasNextPage && fetchNextPage();
  }, [fetchNextPage, hasNextPage]);

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
    const groupData = groupReminder(data ?? []);

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

  const handleChangeMonth = useCallback((date: DateData) => {
    listRef.current?.scrollToLocation({
      itemIndex: 0,
      sectionIndex: 0,
      animated: true,
    });
    requestAnimationFrame(() => {
      setCalendarDate(date);
    });
  }, []);

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
      <CalendarProvider date={currentDate} onMonthChange={handleChangeMonth}>
        <View className="gap-4 flex-1">
          <Calendar
            marked={marked}
            calendarClassName="bg-background-calendar"
            arrowClassName="text-text-secondary"
            weekTitleClassName="text-text-primary"
          />
          <AgendaList
            ref={listRef}
            onEdit={setAgendaEdit}
            data={groupData}
            onDelete={setAgendaDelete}
            deleting={isDeleting}
            updating={isUpdating}
            loading={isLoading}
            loadingMore={isFetchingNextPage}
            onFetchMore={handleFetchMore}
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
