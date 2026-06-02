import { PET_KEY } from "@/constants/query-keys";
import {
  IMedicalRecordForm,
  medicalRecordSchema,
} from "@/constants/validation";
import { getListPetQuery } from "@/services";
import { date } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";

import { withBottomSheetKeyboardEvents } from "@/hocs/withBottomSheetKeyboardEvents";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform } from "react-native";
import { DateTimePickerController } from "../DatetimePickerController";
import { DocumentsInputController } from "../DocumentsInputController";
import { InputController } from "../InputController";
import { OptionInputController } from "../OptionInputController";
import { PetPickerController } from "../PetPickerController";
import { Button } from "../ui/Button";

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

  const handleSubmitForm = (data: IMedicalRecordForm) => {
    onSubmit(data);
  };
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
