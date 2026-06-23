import { Popup } from "@/components/Popup";
import { Skeleton } from "@/components/Skeleton";
import { Toast } from "@/components/Toast";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { StateView } from "@/components/ui/StateView";
import { Body, Heading } from "@/components/ui/Typography";
import { ReminderDetailSheet } from "@/features/reminders/components/ReminderDetailSheet";
import { ReminderForm } from "@/features/reminders/components/ReminderForm";
import {
  useCreateReminderSheet,
  useReminderCalendar,
} from "@/features/reminders/hooks";
import { IReminder, VisibleReminderStatus } from "@/interfaces";
import {
  formatReminderDate,
  REMINDER_STATUS_LABELS,
  REMINDER_TYPE_LABELS,
} from "@/utils/reminder";
import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { AgendaItem } from "./AgendaItem";
import { Calendar } from "./Calendar";

export const ReminderCalendar = () => {
  const [selectedReminder, setSelectedReminder] = useState<IReminder>();

  const {
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
    handleCancelDelete,
    handleDelete,
    handleNextMonth,
    handlePreviousMonth,
    handleUpdate,
    refetch,
    setAgendaDelete,
    setAgendaEdit,
    setSelectedDate,
    resetFilters,
  } = useReminderCalendar();

  const {
    isCreating,
    openForm,
    handleCloseForm,
    handleCreateReminder,
    handleOpenForm,
  } = useCreateReminderSheet();

  const handleEdit = useCallback(
    (v: IReminder) => {
      if (v.status !== "pending") {
        Toast.warn({
          text: "Create a new reminder if this care task already changed status.",
          title: "Cannot edit this reminder",
          duration: 10_000,
        });
        return;
      }
      setAgendaEdit(v);
    },
    [setAgendaEdit],
  );

  const handleResetFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  return (
    <View className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-12 px-20 pb-safe-offset-120"
      >
        {hasFilters ? (
          <ActiveFilterSummary
            petName={petData?.data.find((pet) => pet.id === petFilter)?.name}
            status={statusFilter}
            type={typeFilter}
            onReset={handleResetFilters}
          />
        ) : null}

        <Calendar
          visibleMonth={visibleMonth}
          selectedDate={selectedDate}
          markedDateCounts={markedDateCounts}
          onSelectDate={setSelectedDate}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
        />

        <SelectedDateSection
          allCount={allReminders.length}
          deleting={isDeleting}
          error={isError}
          hasFilters={hasFilters}
          loading={isLoading}
          reminders={selectedDateReminders}
          selectedDate={selectedDate}
          updating={isUpdating}
          onAddReminder={handleOpenForm}
          onDelete={setAgendaDelete}
          onEdit={handleEdit}
          onOpenReminder={setSelectedReminder}
          onRetry={() => refetch()}
        />
      </ScrollView>

      <ReminderDetailSheet
        visible={!!selectedReminder}
        reminder={selectedReminder}
        actioning={selectedReminder?.id === actioningId}
        onDismiss={() => setSelectedReminder(undefined)}
        onCancelReminder={async (item) => {
          await cancelReminder(item.id);
        }}
      />

      <BottomSheet
        visible={openForm}
        onDismiss={handleCloseForm}
        useScrollView
        titleElement={<Body weight="semiBold">Create reminder</Body>}
      >
        <ReminderForm onSubmit={handleCreateReminder} loading={isCreating} />
      </BottomSheet>

      <BottomSheet
        visible={!!agendaEdit}
        onDismiss={() => setAgendaEdit(undefined)}
        useScrollView
        titleElement={<Body weight="semiBold">Edit reminder</Body>}
      >
        <ReminderForm
          onSubmit={handleUpdate}
          defaultValues={defaultValue}
          loading={isUpdating}
        />
      </BottomSheet>

      <Popup
        visible={!!agendaDelete}
        onCancel={handleCancelDelete}
        onConfirm={handleDelete}
        title="Remove reminder"
        description="Are you sure you want to remove this reminder?"
        variant="delete"
        loading={isDeleting}
      />
    </View>
  );
};

const ActiveFilterSummary = ({
  status,
  type,
  petName,
  onReset,
}: {
  status?: VisibleReminderStatus;
  type?: IReminder["type"];
  petName?: string;
  onReset: () => void;
}) => {
  const labels = [
    status ? REMINDER_STATUS_LABELS[status] : undefined,
    type ? REMINDER_TYPE_LABELS[type] : undefined,
    petName,
  ].filter(Boolean);

  return (
    <View className="flex-row items-center justify-between gap-12 rounded-18 border border-line-subtle bg-background-card px-14 py-10">
      <View className="flex-1">
        <Body variant="body4" className="text-text-muted">
          Filters
        </Body>
        <Body variant="body3" weight="semiBold" numberOfLines={1}>
          {labels.join(" · ")}
        </Body>
      </View>
      <Button variant="ghost" size="sm" onPress={onReset}>
        Reset
      </Button>
    </View>
  );
};

const SelectedDateSection = ({
  selectedDate,
  reminders,
  allCount,
  loading,
  error,
  hasFilters,
  deleting,
  updating,
  onAddReminder,
  onRetry,
  onEdit,
  onDelete,
  onOpenReminder,
}: {
  selectedDate: string;
  reminders: IReminder[];
  allCount: number;
  loading?: boolean;
  error?: boolean;
  hasFilters?: boolean;
  deleting?: boolean;
  updating?: boolean;
  onAddReminder: () => void;
  onRetry?: () => void;
  onEdit: (v: IReminder) => void;
  onDelete: (v: IReminder) => void;
  onOpenReminder: (v: IReminder) => void;
}) => {
  const countLabel = `${reminders.length} care ${
    reminders.length === 1 ? "task" : "tasks"
  }`;

  return (
    <View className="gap-12">
      <View className="flex-row items-start justify-between gap-12">
        <View className="flex-1">
          <Heading variant="h5" weight="bold">
            {formatReminderDate(selectedDate)}
          </Heading>
          <Body variant="body3" className="text-text-muted">
            {loading ? "Checking care tasks..." : countLabel}
          </Body>
        </View>
        <Button size="sm" variant="secondary" onPress={onAddReminder}>
          Add
        </Button>
      </View>

      {loading ? (
        <ReminderListSkeleton />
      ) : error ? (
        <StateView
          variant="error"
          title="Could not load reminders"
          description="Please try again."
          actionLabel="Retry"
          onAction={onRetry}
          className="rounded-20 bg-background-card"
        />
      ) : reminders.length ? (
        <View>
          {reminders.map((item) => (
            <AgendaItem
              key={item.id}
              item={item}
              onPress={onOpenReminder}
              onEdit={onEdit}
              onDelete={onDelete}
              editing={updating}
              deleting={deleting}
            />
          ))}
        </View>
      ) : (
        <StateView
          variant="empty"
          title={
            allCount === 0 && !hasFilters
              ? "No reminders yet"
              : "No reminders for this day"
          }
          description={
            allCount === 0 && !hasFilters
              ? "Create your first care reminder for feeding, medicine, grooming, or vaccines."
              : "Add a reminder to stay on top of your pet care."
          }
          actionLabel="Add reminder"
          onAction={onAddReminder}
          className="min-h-140 gap-8 rounded-20 bg-background-card px-20 py-20"
        />
      )}
    </View>
  );
};

const ReminderListSkeleton = () => (
  <View className="gap-12">
    <Skeleton
      className="h-112 rounded-20"
      backgroundClassName="bg-background-card"
    />
    <Skeleton
      className="h-112 rounded-20"
      backgroundClassName="bg-background-card"
    />
  </View>
);
