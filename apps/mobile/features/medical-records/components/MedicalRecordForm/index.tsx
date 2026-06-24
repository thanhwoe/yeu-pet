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
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, View } from "react-native";

const EnhancedInputController = withBottomSheetKeyboardEvents(InputController);

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
  const recordUsage =
    entitlements?.usage.medicalRecords ?? recordLimit.usage ?? 0;
  const maxFiles =
    entitlements?.limits.maxImagesPerMedicalRecord ??
    getLimitState("maxImagesPerMedicalRecord").limit ??
    5;

  const handleSubmitForm = (data: IMedicalRecordForm) => {
    onSubmit(data);
  };

  if (!defaultValues && isEntitlementsLoading && !entitlements) {
    return (
      <View className="min-h-240 px-26 pb-safe-offset-8">
        <StateView
          variant="loading"
          title="Checking your plan"
          description="Making sure there is room for another health record."
        />
      </View>
    );
  }

  if (!defaultValues && isEntitlementsError && !entitlements) {
    return (
      <View className="min-h-240 px-26 pb-safe-offset-8">
        <StateView
          variant="error"
          title="Could not check your record limit"
          description="Check your connection and try again."
          actionLabel="Try again"
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
          title="Medical record limit reached"
          description="Upgrade to Premium to keep unlimited health records and attach more images to each record."
          benefits={[
            "Unlimited medical records",
            "Up to 5 images per record",
            "Export medical summaries",
          ]}
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
        label="Choose your pet"
        options={data?.data ?? []}
      />
      <EnhancedInputController
        control={control}
        name="title"
        label="Title"
        placeholder="Title"
      />
      <DateTimePickerController
        name="date"
        control={control}
        label="Date"
        placeholder="Select date"
        mode="date"
        format={(val) => date(val).format("LL")}
      />

      <OptionInputController<IMedicalRecordForm>
        control={control}
        name="recordType"
        label="Type"
        placeholder="Type"
        options={[
          {
            label: "Vaccination",
            value: "vaccination",
          },
          {
            label: "Checkup",
            value: "checkup",
          },
          {
            label: "Surgery",
            value: "surgery",
          },
          {
            label: "Medication",
            value: "medication",
          },
        ]}
      />
      <EnhancedInputController
        control={control}
        name="vetClinic"
        label="Vet Clinic Name"
        placeholder="Enter vet clinic name"
      />
      <EnhancedInputController
        control={control}
        name="vetName"
        label="Vet Name"
        placeholder="Enter vet name"
      />

      <EnhancedInputController
        control={control}
        name="description"
        label="Description"
        placeholder="Description"
        multiline
      />
      <DocumentsInputController<IMedicalRecordForm>
        control={control}
        name="attachments"
        existingName="attachmentIds"
        label="Medical files"
        maxFiles={maxFiles}
      />

      <Button
        onPress={() => handleSubmit(handleSubmitForm)()}
        className="mt-16"
        disabled={!isDirty}
        loading={loading}
      >
        {!!defaultValues ? "Update Medical Record" : "Create Medical Record"}
      </Button>
    </KeyboardAvoidingView>
  );
};
