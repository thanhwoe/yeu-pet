import { DateTimePickerController } from "@/components/DatetimePickerController";
import { InputController } from "@/components/InputController";
import { OptionInputController } from "@/components/OptionInputController";
import { PaywallNotice } from "@/components/PaywallNotice";
import { PetPickerController } from "@/components/PetPickerController";
import { Toast } from "@/components/Toast";
import { Button } from "@/components/ui/Button";
import { StateView } from "@/components/ui/StateView";
import { Body } from "@/components/ui/Typography";
import { PET_KEY } from "@/constants/query-keys";
import { IReminderForm, reminderSchema } from "@/constants/validation";
import { ReminderTypeIcon } from "@/features/reminders/components/ReminderIcons";
import { useEntitlements } from "@/features/subscriptions/useEntitlements";
import { withBottomSheetKeyboardEvents } from "@/hocs/withBottomSheetKeyboardEvents";
import { getListPetQuery } from "@/services";
import { date } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { KeyboardAvoidingView, Platform, View } from "react-native";

const EnhancedInputController = withBottomSheetKeyboardEvents(InputController);

interface IProps {
  onSubmit: (data: IReminderForm) => Promise<void>;
  defaultValues?: IReminderForm;
  loading?: boolean;
}

const TYPE_OPTIONS = [
  {
    label: "Feeding",
    value: "feeding",
    icon: <ReminderTypeIcon type="feeding" />,
  },
  {
    label: "Grooming",
    value: "grooming",
    icon: <ReminderTypeIcon type="grooming" />,
  },
  {
    label: "Vaccination",
    value: "vaccination",
    icon: <ReminderTypeIcon type="vaccination" />,
  },
  {
    label: "Medication",
    value: "medication",
    icon: <ReminderTypeIcon type="medication" />,
  },
];

const REPEAT_OPTIONS = [
  { label: "Does not repeat", value: "none" },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
];

export const ReminderForm = ({ onSubmit, defaultValues, loading }: IProps) => {
  const { control, handleSubmit } = useForm<IReminderForm>({
    resolver: zodResolver(reminderSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      repeatFrequency: "none",
      repeatInterval: 1,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...defaultValues,
    },
  });

  const repeatFrequency = useWatch({ control, name: "repeatFrequency" });
  const scheduledAt = useWatch({ control, name: "scheduledAt" });

  const { data } = useQuery({
    queryKey: PET_KEY.list(),
    queryFn: getListPetQuery,
  });

  const {
    entitlements,
    getLimitState,
    isError: isEntitlementsError,
    isLoading: isEntitlementsLoading,
    isUpgrading,
    refetch: refetchEntitlements,
    upgrade,
  } = useEntitlements();
  const activeReminderLimit = getLimitState("maxActiveReminders");
  const recurringReminderBlocked =
    repeatFrequency !== "none" &&
    Boolean(repeatFrequency) &&
    entitlements?.limits.recurringReminders === false;
  const isCreating = !defaultValues;

  const handleSubmitForm = async (data: IReminderForm) => {
    if (isCreating && !activeReminderLimit.allowed) {
      Toast.warn({
        title: "Reminder limit reached",
        text: "Upgrade to Premium to create more active reminders.",
      });
      return;
    }

    if (recurringReminderBlocked) {
      Toast.warn({
        title: "Recurring reminders require Premium",
        text: "Choose a one-time reminder or upgrade to Premium.",
      });
      return;
    }

    await onSubmit({
      ...data,
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
      petId: data.petId || null,
      repeatFrequency: data.repeatFrequency ?? "none",
      repeatInterval: data.repeatFrequency === "none" ? undefined : 1,
      repeatUntil:
        data.repeatFrequency === "none" ? null : (data.repeatUntil ?? null),
      timezone:
        data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  };

  if (isCreating && isEntitlementsLoading && !entitlements) {
    return (
      <View className="min-h-240 px-20 pb-safe-offset-8">
        <StateView
          variant="loading"
          title="Checking your plan"
          description="Making sure there is room for another reminder."
        />
      </View>
    );
  }

  if (isCreating && isEntitlementsError && !entitlements) {
    return (
      <View className="min-h-240 px-20 pb-safe-offset-8">
        <StateView
          variant="error"
          title="Could not check your reminder limit"
          description="Check your connection and try again."
          actionLabel="Try again"
          onAction={() => void refetchEntitlements()}
        />
      </View>
    );
  }

  if (isCreating && !activeReminderLimit.allowed) {
    return (
      <KeyboardAvoidingView
        className="px-20 pb-safe-offset-8"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <PaywallNotice
          variant="blocking"
          title="Reminder limit reached"
          description={`Free plan includes ${activeReminderLimit.limit} active reminders. Upgrade to Premium to keep every care routine on schedule.`}
          benefits={[
            "Unlimited active reminders",
            "Recurring care schedules",
            "More room for every pet",
          ]}
          loading={isUpgrading}
          onAction={() => void upgrade()}
        />
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      className="gap-16 px-20 pb-safe-offset-8"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <PetPickerController
        name="petId"
        control={control}
        label="Pet"
        options={data?.data ?? []}
        allowNone
      />

      <EnhancedInputController
        control={control}
        name="title"
        label="Title"
        placeholder="Reminder title"
      />

      <OptionInputController<IReminderForm>
        control={control}
        name="type"
        label="Type"
        placeholder="Select type"
        options={TYPE_OPTIONS}
      />

      <DateTimePickerController
        name="scheduledAt"
        control={control}
        label="Scheduled date & time"
        placeholder="Select date & time"
        mode="datetime"
        minimumDate={new Date()}
        format={(val) => date(val).format("LLL")}
      />

      <EnhancedInputController
        control={control}
        name="description"
        label="Description"
        placeholder="Optional notes"
        multiline
        numberOfLines={3}
      />

      <View className="gap-10">
        <OptionInputController<IReminderForm>
          control={control}
          name="repeatFrequency"
          label="Repeat"
          placeholder="Does not repeat"
          options={REPEAT_OPTIONS}
        />
        {repeatFrequency && repeatFrequency !== "none" ? (
          <>
            <Body variant="body4" className="text-text-muted">
              Repeats once every selected period.
            </Body>
            <DateTimePickerController
              name="repeatUntil"
              control={control}
              label="End repeat"
              placeholder="Never"
              mode="date"
              minimumDate={scheduledAt ?? new Date()}
              format={(val) => date(val).format("LL")}
            />
            {recurringReminderBlocked ? (
              <PaywallNotice
                variant="inline"
                title="Recurring reminders are Premium"
                description="Choose a one-time reminder or upgrade to repeat this care task automatically."
                loading={isUpgrading}
                onAction={() => void upgrade()}
              />
            ) : null}
          </>
        ) : null}
      </View>

      <Button
        onPress={() => handleSubmit(handleSubmitForm)()}
        className="mt-8"
        loading={loading}
        disabled={recurringReminderBlocked}
      >
        {!!defaultValues ? "Update reminder" : "Create reminder"}
      </Button>
    </KeyboardAvoidingView>
  );
};
