import { IPetInfoForm, petInfoSchema } from "@/constants/validation";
import { date } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { AvatarInputController } from "../AvatarInputController";
import { DateTimePickerController } from "../DatetimePickerController";
import { InputController } from "../InputController";
import { OptionInputController } from "../OptionInputController";
import { Button } from "../ui/Button";
import { UnitInputController } from "../UnitInputController";

interface IProps {
  onSubmit: (data: IPetInfoForm) => Promise<void>;
  defaultValues?: IPetInfoForm;
}

export const PetInfoForm = ({ onSubmit, defaultValues }: IProps) => {
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  const { control, handleSubmit, watch } = useForm<IPetInfoForm>({
    resolver: zodResolver(petInfoSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues,
  });
  const birthdate = watch("birthdate");

  const age = birthdate
    ? `${date(new Date()).year() - date(birthdate).year()}`
    : undefined;

  const handleSubmitForm = (data: IPetInfoForm) => {
    startTransition(async () => {
      if (data?.age) {
        await onSubmit(data);
      } else {
        await onSubmit({ ...data, age });
      }
    });
  };
  return (
    <View className="px-4 pb-4">
      <InputController<IPetInfoForm>
        control={control}
        name="name"
        label="name"
        placeholder="name"
      />
      <View className="flex-row gap-10 pr-4">
        <View className="flex-1">
          <InputController<IPetInfoForm>
            control={control}
            name="breed"
            label="breed"
            placeholder="Husky"
          />

          <InputController<IPetInfoForm>
            control={control}
            name="color"
            label="color"
            placeholder="Orange"
          />
        </View>
        <AvatarInputController<IPetInfoForm>
          control={control}
          name="avatar_url"
          label="Upload avatar"
          onProcess={setUploading}
        />
      </View>
      <UnitInputController<IPetInfoForm>
        control={control}
        name="weight"
        label="Weight"
        inputMode="numeric"
        placeholder="0 kg"
        options={[
          { label: "Kilogram", value: "kg" },
          { label: "Pound", value: "lbs" },
        ]}
      />
      <OptionInputController<IPetInfoForm>
        control={control}
        name="gender"
        label="gender"
        placeholder="gender"
        options={[
          { label: "Male", value: "male" },
          { label: "Female", value: "female" },
          { label: "Unknown", value: "unknown" },
        ]}
      />
      <OptionInputController<IPetInfoForm>
        control={control}
        name="species"
        label="species"
        placeholder="species"
        options={[
          { label: "Dog", value: "dog" },
          { label: "Cat", value: "cat" },
          { label: "Bird", value: "bird" },
          { label: "Rabbit", value: "rabbit" },
          { label: "Other", value: "other" },
        ]}
      />
      <View className="flex-row gap-4 items-center">
        <View className="flex-1 basis-2/3">
          <DateTimePickerController
            name="birthdate"
            control={control}
            label="Birthdate"
            placeholder="Select date & time"
            mode="date"
            format={(val) => date(val).format("LL")}
          />
        </View>
        <View className="flex-1 basis-1/3">
          <InputController<IPetInfoForm>
            control={control}
            name="age"
            label="Age"
            placeholder="0 years"
            defaultValue={age}
          />
        </View>
      </View>
      <InputController<IPetInfoForm>
        control={control}
        name="notes"
        label="Notes"
        placeholder="Notes"
        multiline
      />
      <Button
        onPress={() => handleSubmit(handleSubmitForm)()}
        disabled={isPending || uploading}
        loading={isPending || uploading}
      >
        {!!defaultValues ? "Update Pet" : "Add Pet"}
      </Button>
    </View>
  );
};
