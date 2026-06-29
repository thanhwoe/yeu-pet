import { PET_KEY } from "@/constants/query-keys";
import {
  IMedicalRecordForm,
  medicalRecordSchema,
} from "@/constants/validation";
import { useEntitlements } from "@/features/subscriptions/useEntitlements";
import { getListPetQuery } from "@/services";
import { date } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";

import { DateTimePickerController } from "@/components/DatetimePickerController";
import { DocumentsInputController } from "@/components/DocumentsInputController";
import { InputController } from "@/components/InputController";
import { OptionInputController } from "@/components/OptionInputController";
import { PaywallNotice } from "@/components/PaywallNotice";
import { PetPickerController } from "@/components/PetPickerController";
import { Button } from "@/components/ui/Button";
import { StateView } from "@/components/ui/StateView";
import { withBottomSheetKeyboardEvents } from "@/hocs/withBottomSheetKeyboardEvents";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, View } from "react-native";

const EnhancedInputController = withBottomSheetKeyboardEvents(InputController);
const RECORD_TYPE_OPTIONS = [
  {
    labelKey: "medicalRecords.type.vaccination",
    value: "vaccination",
  },
  {
    labelKey: "medicalRecords.type.checkup",
    value: "checkup",
  },
  {
    labelKey: "medicalRecords.type.surgery",
    value: "surgery",
  },
  {
    labelKey: "medicalRecords.type.medication",
    value: "medication",
  },
];

interface IProps {
  onSubmit: (data: IMedicalRecordForm) => Promise<void>;
  defaultValues?: IMedicalRecordForm;
  loading?: boolean;
}

export const MedicalRecordForm = ({
  onSubmit,
  defaultValues,
  loading,
}: IProps) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<IMedicalRecordForm>({
    resolver: zodResolver(medicalRecordSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: defaultValues,
  });

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
  const recordLimit = getLimitState("maxMedicalRecords");
  const maxFiles =
    entitlements?.limits.maxImagesPerMedicalRecord ??
    getLimitState("maxImagesPerMedicalRecord").limit ??
    5;
  const recordTypeOptions = useMemo(
    () =>
      RECORD_TYPE_OPTIONS.map(({ labelKey, ...item }) => ({
        ...item,
        label: t(labelKey),
      })),
    [t],
  );
  const limitBenefits = useMemo(() => {
    const benefits = t("medicalRecords.limit.benefits", {
      returnObjects: true,
    });

    return Array.isArray(benefits) ? benefits.map(String) : [];
  }, [t]);

  const handleSubmitForm = (data: IMedicalRecordForm) => {
    onSubmit(data);
  };

  if (!defaultValues && isEntitlementsLoading && !entitlements) {
    return (
      <View className="min-h-240 px-26 pb-safe-offset-8">
        <StateView
          variant="loading"
          title={t("medicalRecords.limit.loadingTitle")}
          description={t("medicalRecords.limit.loadingDescription")}
        />
      </View>
    );
  }

  if (!defaultValues && isEntitlementsError && !entitlements) {
    return (
      <View className="min-h-240 px-26 pb-safe-offset-8">
        <StateView
          variant="error"
          title={t("medicalRecords.limit.errorTitle")}
          description={t("medicalRecords.limit.errorDescription")}
          actionLabel={t("common.tryAgain")}
          onAction={() => void refetchEntitlements()}
        />
      </View>
    );
  }

  if (!defaultValues && !recordLimit.allowed) {
    return (
      <KeyboardAvoidingView
        className="px-26 pb-safe-offset-8"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <PaywallNotice
          variant="blocking"
          title={t("medicalRecords.limit.reachedTitle")}
          description={t("medicalRecords.limit.reachedDescription")}
          benefits={limitBenefits}
          loading={isUpgrading}
          onAction={() => void upgrade()}
        />
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      className="px-26 gap-16 pb-safe-offset-8"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <PetPickerController
        name="petId"
        control={control}
        label={t("medicalRecords.form.pet")}
        options={data?.data ?? []}
      />
      <EnhancedInputController
        control={control}
        name="title"
        label={t("medicalRecords.form.title.label")}
        placeholder={t("medicalRecords.form.title.placeholder")}
      />
      <DateTimePickerController
        name="date"
        control={control}
        label={t("medicalRecords.form.date.label")}
        placeholder={t("medicalRecords.form.date.placeholder")}
        mode="date"
        format={(val) => date(val).format("LL")}
      />

      <OptionInputController<IMedicalRecordForm>
        control={control}
        name="recordType"
        label={t("medicalRecords.form.type.label")}
        placeholder={t("medicalRecords.form.type.placeholder")}
        options={recordTypeOptions}
      />
      <EnhancedInputController
        control={control}
        name="vetClinic"
        label={t("medicalRecords.form.vetClinic.label")}
        placeholder={t("medicalRecords.form.vetClinic.placeholder")}
      />
      <EnhancedInputController
        control={control}
        name="vetName"
        label={t("medicalRecords.form.vetName.label")}
        placeholder={t("medicalRecords.form.vetName.placeholder")}
      />

      <EnhancedInputController
        control={control}
        name="description"
        label={t("medicalRecords.form.description.label")}
        placeholder={t("medicalRecords.form.description.placeholder")}
        multiline
      />
      <DocumentsInputController<IMedicalRecordForm>
        control={control}
        name="attachments"
        existingName="attachmentIds"
        label={t("medicalRecords.form.attachments")}
        maxFiles={maxFiles}
      />

      <Button
        onPress={() => handleSubmit(handleSubmitForm)()}
        className="mt-16"
        disabled={!isDirty}
        loading={loading}
      >
        {defaultValues
          ? t("medicalRecords.actions.update")
          : t("medicalRecords.actions.create")}
      </Button>
    </KeyboardAvoidingView>
  );
};
