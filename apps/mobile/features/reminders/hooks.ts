import { Toast } from "@/components/Toast";
import { PET_KEY, REMINDER_KEY } from "@/constants/query-keys";
import { IReminderForm } from "@/constants/validation";
import { IReminder } from "@/interfaces";
import { useReminderUiStore } from "@/features/reminders/store";
import {
  cancelReminderMutation,
  completeReminderMutation,
  createReminderMutation,
  deleteReminderMutation,
  getListPetQuery,
  getListReminderQuery,
  skipReminderMutation,
  updateReminderMutation,
} from "@/services";
import {
  getMarkedDateCounts,
  getRemindersForDay,
  REMINDER_DAY_KEY_FORMAT,
  sortRemindersByTime,
} from "@/utils/reminder";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";

const toSupportedRepeatFrequency = (
  value: IReminder["repeatFrequency"],
): IReminderForm["repeatFrequency"] =>
  value && value !== "custom" ? value : "none";

export function useReminderCalendar() {
  const [agendaEdit, setAgendaEdit] = useState<IReminder>();
  const [agendaDelete, setAgendaDelete] = useState<IReminder>();
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format(REMINDER_DAY_KEY_FORMAT),
  );
  const [visibleMonth, setVisibleMonth] = useState(
    dayjs().startOf("month").format(REMINDER_DAY_KEY_FORMAT),
  );
  const statusFilter = useReminderUiStore((state) => state.statusFilter);
  const typeFilter = useReminderUiStore((state) => state.typeFilter);
  const petFilter = useReminderUiStore((state) => state.petFilter);
  const setFilters = useReminderUiStore((state) => state.setFilters);
  const resetFilters = useReminderUiStore((state) => state.resetFilters);

  const queryClient = useQueryClient();

  const reminderParams = useMemo(
    () => ({
      month: dayjs(visibleMonth).month() + 1,
      year: dayjs(visibleMonth).year(),
      status: statusFilter,
      type: typeFilter,
      petId: petFilter,
      limit: 100,
    }),
    [petFilter, statusFilter, typeFilter, visibleMonth],
  );

  const { data: petData } = useQuery({
    queryKey: PET_KEY.list(),
    queryFn: getListPetQuery,
  });

  const {
    data,
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: REMINDER_KEY.list(reminderParams),
    queryFn: () => getListReminderQuery(reminderParams),
  });

  const { mutateAsync: updateReminder, isPending: isUpdating } = useMutation({
    mutationFn: updateReminderMutation,
    onError(e) {
      Toast.error({ text: e.message });
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: REMINDER_KEY.all });
      setAgendaEdit(undefined);
    },
  });

  const { mutateAsync: deleteReminder, isPending: isDeleting } = useMutation({
    mutationFn: deleteReminderMutation,
    onError(e) {
      Toast.error({ text: e.message });
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: REMINDER_KEY.all });
      setAgendaDelete(undefined);
    },
  });

  const statusMutationOptions = {
    onError(e: Error) {
      Toast.error({ text: e.message });
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: REMINDER_KEY.all });
    },
  };

  const { mutateAsync: completeReminder, variables: completingId } =
    useMutation({
      mutationFn: completeReminderMutation,
      ...statusMutationOptions,
    });

  const { mutateAsync: skipReminder, variables: skippingId } = useMutation({
    mutationFn: skipReminderMutation,
    ...statusMutationOptions,
  });

  const { mutateAsync: cancelReminder, variables: cancellingId } = useMutation({
    mutationFn: cancelReminderMutation,
    ...statusMutationOptions,
  });

  const allReminders = useMemo(
    () => sortRemindersByTime(data?.data ?? []),
    [data?.data],
  );

  const selectedDateReminders = useMemo(
    () => getRemindersForDay(allReminders, selectedDate),
    [allReminders, selectedDate],
  );

  const markedDateCounts = useMemo(
    () => getMarkedDateCounts(allReminders),
    [allReminders],
  );

  const handleUpdate = useCallback(
    async (data: IReminderForm) => {
      if (agendaEdit?.id) {
        await updateReminder({ ...data, id: agendaEdit.id });
      }
    },
    [agendaEdit?.id, updateReminder],
  );

  const handleDelete = useCallback(async () => {
    if (agendaDelete?.id) {
      await deleteReminder(agendaDelete.id);
    }
  }, [agendaDelete?.id, deleteReminder]);

  const handleCancelDelete = useCallback(() => setAgendaDelete(undefined), []);

  const defaultValue: IReminderForm | undefined = useMemo(() => {
    if (!agendaEdit) {
      return;
    }

    return {
      scheduledAt: dayjs(agendaEdit.scheduledAt).toDate(),
      title: agendaEdit.title,
      type: agendaEdit.type,
      description: agendaEdit.description ?? "",
      petId: agendaEdit.petId,
      repeatFrequency: toSupportedRepeatFrequency(agendaEdit.repeatFrequency),
      repeatInterval: agendaEdit.repeatInterval ?? 1,
      repeatUntil: agendaEdit.repeatUntil
        ? dayjs(agendaEdit.repeatUntil).toDate()
        : null,
      timezone: agendaEdit.timezone ?? undefined,
    };
  }, [agendaEdit]);

  const hasFilters = !!statusFilter || !!typeFilter || !!petFilter;
  const actioningId = completingId ?? skippingId ?? cancellingId;

  const handlePreviousMonth = useCallback(() => {
    const nextMonth = dayjs(visibleMonth).subtract(1, "month").startOf("month");
    const nextSelectedDate = nextMonth.format(REMINDER_DAY_KEY_FORMAT);

    setVisibleMonth(nextSelectedDate);
    setSelectedDate(nextSelectedDate);
  }, [visibleMonth]);

  const handleNextMonth = useCallback(() => {
    const nextMonth = dayjs(visibleMonth).add(1, "month").startOf("month");
    const nextSelectedDate = nextMonth.format(REMINDER_DAY_KEY_FORMAT);

    setVisibleMonth(nextSelectedDate);
    setSelectedDate(nextSelectedDate);
  }, [visibleMonth]);

  return {
    actioningId,
    agendaDelete,
    agendaEdit,
    allReminders,
    defaultValue,
    hasFilters,
    isDeleting,
    isError,
    isLoading,
    isUpdating,
    markedDateCounts,
    petData,
    petFilter,
    selectedDate,
    selectedDateReminders,
    statusFilter,
    typeFilter,
    visibleMonth,
    cancelReminder,
    completeReminder,
    handleCancelDelete,
    handleDelete,
    handleNextMonth,
    handlePreviousMonth,
    handleUpdate,
    refetch,
    setAgendaDelete,
    setAgendaEdit,
    setSelectedDate,
    setFilters,
    resetFilters,
    skipReminder,
  };
}

export function useCreateReminderSheet() {
  const [openForm, setOpenForm] = useState(false);
  const queryClient = useQueryClient();

  const { mutateAsync: createReminder, isPending: isCreating } = useMutation({
    mutationFn: createReminderMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDER_KEY.all });
      setOpenForm(false);
      Toast.success({ text: "Reminder added." });
    },
    onError: (e) => {
      Toast.error({ text: e.message });
    },
  });

  const handleCreateReminder = useCallback(
    async (data: IReminderForm) => {
      await createReminder(data);
    },
    [createReminder],
  );

  const handleOpenForm = useCallback(() => {
    setOpenForm(true);
  }, []);

  const handleCloseForm = useCallback(() => setOpenForm(false), []);

  return {
    isCreating,
    openForm,
    handleCloseForm,
    handleCreateReminder,
    handleOpenForm,
  };
}
