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
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, View } from "react-native";

const EnhancedInputController = withBottomSheetKeyboardEvents(InputController);

interface IProps {
  onSubmit: (data: IReminderForm) => Promise<void>;
  defaultValues?: IReminderForm;
  loading?: boolean;
}

const TYPE_OPTIONS = [
  {
    labelKey: "reminders.type.feeding",
    value: "feeding",
    icon: <ReminderTypeIcon type="feeding" />,
  },
  {
    labelKey: "reminders.type.grooming",
    value: "grooming",
    icon: <ReminderTypeIcon type="grooming" />,
  },
  {
    labelKey: "reminders.type.vaccination",
    value: "vaccination",
    icon: <ReminderTypeIcon type="vaccination" />,
  },
  {
    labelKey: "reminders.type.medication",
    value: "medication",
    icon: <ReminderTypeIcon type="medication" />,
  },
];

const REPEAT_OPTIONS = [
  { labelKey: "reminders.repeat.none", value: "none" },
  { labelKey: "reminders.repeat.daily", value: "daily" },
  { labelKey: "reminders.repeat.weekly", value: "weekly" },
  { labelKey: "reminders.repeat.monthly", value: "monthly" },
  { labelKey: "reminders.repeat.yearly", value: "yearly" },
];

export const ReminderForm = ({ onSubmit, defaultValues, loading }: IProps) => {
  const { t } = useTranslation();
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
  const typeOptions = useMemo(
    () =>
      TYPE_OPTIONS.map(({ labelKey, ...item }) => ({
        ...item,
        label: t(labelKey),
      })),
    [t],
  );
  const repeatOptions = useMemo(
    () =>
      REPEAT_OPTIONS.map(({ labelKey, ...item }) => ({
        ...item,
        label: t(labelKey),
      })),
    [t],
  );
  const limitBenefits = useMemo(() => {
    const benefits = t("reminders.form.limitReached.benefits", {
      returnObjects: true,
    });

    return Array.isArray(benefits) ? benefits.map(String) : [];
  }, [t]);

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
        title: t("reminders.toast.limitReachedTitle"),
        text: t("reminders.toast.limitReachedText"),
      });
      return;
    }

    if (recurringReminderBlocked) {
      Toast.warn({
        title: t("reminders.toast.recurringBlockedTitle"),
        text: t("reminders.toast.recurringBlockedText"),
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
          title={t("reminders.form.limitLoading.title")}
          description={t("reminders.form.limitLoading.description")}
        />
      </View>
    );
  }

  if (isCreating && isEntitlementsError && !entitlements) {
    return (
      <View className="min-h-240 px-20 pb-safe-offset-8">
        <StateView
          variant="error"
          title={t("reminders.form.limitError.title")}
          description={t("reminders.form.limitError.description")}
          actionLabel={t("common.tryAgain")}
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
          title={t("reminders.form.limitReached.title")}
          description={t("reminders.form.limitReached.description", {
            limit: activeReminderLimit.limit,
          })}
          benefits={limitBenefits}
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
        label={t("reminders.form.pet.label")}
        options={data?.data ?? []}
        allowNone
      />

      <EnhancedInputController
        control={control}
        name="title"
        label={t("reminders.form.titleField.label")}
        placeholder={t("reminders.form.titleField.placeholder")}
      />

      <OptionInputController<IReminderForm>
        control={control}
        name="type"
        label={t("reminders.form.type.label")}
        placeholder={t("reminders.form.type.placeholder")}
        options={typeOptions}
      />

      <DateTimePickerController
        name="scheduledAt"
        control={control}
        label={t("reminders.form.schedule.label")}
        placeholder={t("reminders.form.schedule.placeholder")}
        mode="datetime"
        minimumDate={new Date()}
        format={(val) => date(val).format("LLL")}
      />

      <EnhancedInputController
        control={control}
        name="description"
        label={t("reminders.form.description.label")}
        placeholder={t("reminders.form.description.placeholder")}
        multiline
        numberOfLines={3}
      />

      <View className="gap-10">
        <OptionInputController<IReminderForm>
          control={control}
          name="repeatFrequency"
          label={t("reminders.form.repeat.label")}
          placeholder={t("reminders.form.repeat.placeholder")}
          options={repeatOptions}
        />
        {repeatFrequency && repeatFrequency !== "none" ? (
          <>
            <Body variant="body4" className="text-text-muted">
              {t("reminders.form.repeat.note")}
            </Body>
            <DateTimePickerController
              name="repeatUntil"
              control={control}
              label={t("reminders.form.endRepeat.label")}
              placeholder={t("reminders.form.endRepeat.placeholder")}
              mode="date"
              minimumDate={scheduledAt ?? new Date()}
              format={(val) => date(val).format("LL")}
            />
            {recurringReminderBlocked ? (
              <PaywallNotice
                variant="inline"
                title={t("reminders.form.premiumRepeat.title")}
                description={t("reminders.form.premiumRepeat.description")}
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
        {defaultValues
          ? t("reminders.actions.update")
          : t("reminders.actions.create")}
      </Button>
    </KeyboardAvoidingView>
  );
};
