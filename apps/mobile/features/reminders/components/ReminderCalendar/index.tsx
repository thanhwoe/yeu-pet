import { ReminderStatus, ReminderType } from "@/interfaces";
import { cn } from "@/utils";
import dayjs from "dayjs";
import { ReactNode } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { CalendarProvider } from "react-native-calendars";
import { Popup } from "@/components/Popup";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Body } from "@/components/ui/Typography";
import { useReminderCalendar } from "@/features/reminders/hooks";
import { ReminderForm } from "@/features/reminders/components/ReminderForm";
import { AgendaList } from "./AgendaList";
import { Calendar } from "./Calendar";

const currentDate = dayjs().toString();

const STATUS_FILTERS: { label: string; value?: ReminderStatus }[] = [
  { label: "All" },
  { label: "Pending", value: "pending" },
  { label: "Done", value: "completed" },
  { label: "Skipped", value: "skipped" },
  { label: "Cancelled", value: "cancelled" },
];

const TYPE_FILTERS: { label: string; value?: ReminderType }[] = [
  { label: "All types" },
  { label: "Feeding", value: "feeding" },
  { label: "Grooming", value: "grooming" },
  { label: "Vaccine", value: "vaccination" },
  { label: "Medicine", value: "medication" },
];

export const ReminderCalendar = () => {
  const {
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
  } = useReminderCalendar();

  return (
    <View className="flex-1 mx-20">
      <CalendarProvider date={currentDate} onMonthChange={setCalendarDate}>
        <View className="gap-4 flex-1">
          <ReminderFilters
            pets={petData?.data ?? []}
            status={statusFilter}
            type={typeFilter}
            petId={petFilter}
            onStatusChange={setStatusFilter}
            onTypeChange={setTypeFilter}
            onPetChange={setPetFilter}
          />
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
            error={isError}
            hasFilters={hasFilters}
            actioningId={actioningId}
            onRetry={() => refetch()}
            onComplete={(item) => completeReminder(item.id)}
            onSkip={(item) => skipReminder(item.id)}
            onCancelReminder={(item) => cancelReminder(item.id)}
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

const ReminderFilters = ({
  pets,
  status,
  type,
  petId,
  onStatusChange,
  onTypeChange,
  onPetChange,
}: {
  pets: { id: string; name: string }[];
  status?: ReminderStatus;
  type?: ReminderType;
  petId?: string;
  onStatusChange: (status?: ReminderStatus) => void;
  onTypeChange: (type?: ReminderType) => void;
  onPetChange: (petId?: string) => void;
}) => (
  <View className="gap-10">
    <FilterRow>
      {STATUS_FILTERS.map((item) => (
        <FilterChip
          key={item.label}
          label={item.label}
          selected={status === item.value}
          onPress={() => onStatusChange(item.value)}
        />
      ))}
    </FilterRow>
    <FilterRow>
      {TYPE_FILTERS.map((item) => (
        <FilterChip
          key={item.label}
          label={item.label}
          selected={type === item.value}
          onPress={() => onTypeChange(item.value)}
        />
      ))}
    </FilterRow>
    {pets.length > 0 ? (
      <FilterRow>
        <FilterChip
          label="All pets"
          selected={!petId}
          onPress={() => onPetChange(undefined)}
        />
        {pets.map((pet) => (
          <FilterChip
            key={pet.id}
            label={pet.name}
            selected={petId === pet.id}
            onPress={() => onPetChange(pet.id)}
          />
        ))}
      </FilterRow>
    ) : null}
  </View>
);

const FilterRow = ({ children }: { children: ReactNode }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerClassName="gap-8"
  >
    {children}
  </ScrollView>
);

const FilterChip = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    accessibilityRole="button"
    accessibilityState={{ selected }}
    onPress={onPress}
    className={cn(
      "min-h-44 justify-center rounded-24 border border-line-tertiary bg-background-card px-16",
      {
        "border-line-secondary bg-background-secondary": selected,
      },
    )}
  >
    <Body
      variant="body3"
      weight="semiBold"
      className={cn({
        "text-text-secondary": selected,
      })}
    >
      {label}
    </Body>
  </TouchableOpacity>
);
