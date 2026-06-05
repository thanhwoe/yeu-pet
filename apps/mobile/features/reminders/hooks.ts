import { Toast } from "@/components/Toast";
import { PET_KEY, REMINDER_KEY } from "@/constants/query-keys";
import { IReminderForm } from "@/constants/validation";
import { IReminder, ReminderStatus, ReminderType } from "@/interfaces";
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
import { getMarkedDates, groupReminder } from "@/utils/reminder";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import { DateData } from "react-native-calendars";

export function useReminderCalendar() {
  const [agendaEdit, setAgendaEdit] = useState<IReminder>();
  const [agendaDelete, setAgendaDelete] = useState<IReminder>();
  const [calendarDate, setCalendarDate] = useState<DateData>();
  const [statusFilter, setStatusFilter] = useState<ReminderStatus>();
  const [typeFilter, setTypeFilter] = useState<ReminderType>();
  const [petFilter, setPetFilter] = useState<string>();

  const queryClient = useQueryClient();

  const reminderParams = useMemo(
    () => ({
      month: calendarDate?.month,
      year: calendarDate?.year,
      status: statusFilter,
      type: typeFilter,
      petId: petFilter,
    }),
    [
      calendarDate?.month,
      calendarDate?.year,
      petFilter,
      statusFilter,
      typeFilter,
    ],
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
    };
  }, [agendaEdit]);

  const hasFilters = !!statusFilter || !!typeFilter || !!petFilter;
  const actioningId = completingId ?? skippingId ?? cancellingId;

  return {
    actioningId,
    agendaDelete,
    agendaEdit,
    calendarDate,
    defaultValue,
    groupData,
    hasFilters,
    isDeleting,
    isError,
    isLoading,
    isUpdating,
    marked,
    petData,
    petFilter,
    statusFilter,
    typeFilter,
    cancelReminder,
    completeReminder,
    handleCancelDelete,
    handleDelete,
    handleUpdate,
    refetch,
    setAgendaDelete,
    setAgendaEdit,
    setCalendarDate,
    setPetFilter,
    setStatusFilter,
    setTypeFilter,
    skipReminder,
  };
}

export function useCreateReminderSheet() {
  const [openForm, setOpenForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: petData } = useQuery({
    queryKey: PET_KEY.list(),
    queryFn: getListPetQuery,
  });

  const { mutateAsync: createReminder, isPending: isCreating } = useMutation({
    mutationFn: createReminderMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDER_KEY.lists() });
      setOpenForm(false);
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
    if (petData?.data.length) {
      setOpenForm(true);
      return;
    }

    Toast.warn({ text: "Please add a pet first." });
  }, [petData?.data.length]);

  const handleCloseForm = useCallback(() => setOpenForm(false), []);

  return {
    isCreating,
    openForm,
    handleCloseForm,
    handleCreateReminder,
    handleOpenForm,
  };
}
