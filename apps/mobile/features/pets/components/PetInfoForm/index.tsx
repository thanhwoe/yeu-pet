import {
  IPetInfoForm,
  IPetInfoFormInput,
  petInfoSchema,
} from "@/constants/validation";
import { AvatarInputController } from "@/components/AvatarInputController";
import { DateTimePickerController } from "@/components/DatetimePickerController";
import { InputController } from "@/components/InputController";
import { OptionInputController } from "@/components/OptionInputController";
import { UnitInputController } from "@/components/UnitInputController";
import { Button } from "@/components/ui/Button";
import { withBottomSheetKeyboardEvents } from "@/hocs/withBottomSheetKeyboardEvents";
import { date } from "@/utils";
import { calculateAnimalAge } from "@/utils/pet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, View } from "react-native";

interface IProps {
  onSubmit: (data: IPetInfoForm) => Promise<void>;
  isSubmitting?: boolean;
  defaultValues?: IPetInfoForm;
  disabled?: boolean;
}

const EnhancedInputController = withBottomSheetKeyboardEvents(InputController);
const EnhancedUnitInputController =
  withBottomSheetKeyboardEvents(UnitInputController);

export const PetInfoForm = ({
  onSubmit,
  defaultValues,
  isSubmitting,
  disabled,
}: IProps) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
  } = useForm<IPetInfoFormInput, unknown, IPetInfoForm>({
    resolver: zodResolver(petInfoSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues,
  });
  const [birthdate, species] = watch(["birthdate", "species"]);

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const age = useMemo(() => {
    const birthdateValue =
      birthdate instanceof Date || typeof birthdate === "string"
        ? birthdate
        : null;
    const speciesValue = typeof species === "string" ? species : null;
    const result = calculateAnimalAge(birthdateValue, speciesValue);

    if (!result) {
      return "";
    }
    const { days, humanYears, months, years } = result;

    return `${years} years, ${months} months, ${days} days. ${humanYears} human years`;
  }, [birthdate, species]);

  return (
    <KeyboardAvoidingView
      className="px-26 gap-8 pb-safe-offset-8"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <AvatarInputController<IPetInfoFormInput, IPetInfoForm>
        control={control}
        name="avatar"
        label="Upload avatar"
      />
      <EnhancedInputController
        control={control}
        name="name"
        label="Name"
        placeholder="Your pet name"
      />

      <View className="flex-row gap-16">
        <OptionInputController<IPetInfoFormInput, IPetInfoForm>
          control={control}
          name="gender"
          label="Gender"
          placeholder="Gender"
          options={[
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
            { label: "Unknown", value: "unknown" },
          ]}
        />
        <OptionInputController<IPetInfoFormInput, IPetInfoForm>
          control={control}
          name="species"
          label="Species"
          placeholder="Species"
          options={[
            { label: "Dog", value: "dog" },
            { label: "Cat", value: "cat" },
            { label: "Bird", value: "bird" },
            { label: "Rabbit", value: "rabbit" },
            { label: "Hamster", value: "hamster" },
            { label: "Other", value: "other" },
          ]}
        />
      </View>

      <EnhancedInputController
        control={control}
        name="breed"
        label="Breed"
        placeholder="Husky"
      />

      <EnhancedInputController
        control={control}
        name="color"
        label="Fur Color"
        placeholder="Orange"
      />

      <EnhancedUnitInputController
        control={control}
        name="weight"
        label="Weight"
        keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
        placeholder="0.0"
        options={[
          { label: "Kilogram", value: "kg" },
          { label: "Pound", value: "lb" },
        ]}
      />
      <DateTimePickerController<IPetInfoFormInput, IPetInfoForm>
        name="birthdate"
        control={control}
        label="Birthdate"
        placeholder="Select date"
        mode="date"
        maximumDate={new Date()}
        format={(val) => date(val).format("LL")}
        supportText={age}
      />

      <EnhancedInputController
        control={control}
        name="notes"
        label="Notes"
        placeholder="Notes"
        multiline
      />

      <Button
        wrapperClassName="mt-12"
        disabled={disabled || isSubmitting}
        onPress={() => handleSubmit(onSubmit)()}
        loading={isSubmitting}
      >
        {!!defaultValues ? "Update Pet" : "Add Pet"}
      </Button>
    </KeyboardAvoidingView>
  );
};
